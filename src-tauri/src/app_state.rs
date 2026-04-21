use std::{path::PathBuf, sync::Mutex};

use chrono::{Duration, Utc};
use zeroize::{Zeroize, Zeroizing};

use crate::{
    error::AppError,
    integrity,
    models::{
        AddProtectedItemInput, AuthMethod, BootstrapStatus, CameraStatus, EncryptionStatus,
        HydratedAppState, IntegrityStatus, OverviewMetrics, RegisterCameraEventInput, RiskLabel,
        RotatePinInput, SecureState, SecurityEvent, SessionSnapshot, Severity, SetupPinInput,
        UpdateSettingsInput, VaultData,
    },
    security,
    storage::{self, StoragePaths},
};

const MAX_EVENTS: usize = 500;
const LOCKOUT_MINUTES: i64 = 15;

#[derive(Debug)]
struct SessionState {
    key: Zeroizing<Vec<u8>>,
    unlocked_at: chrono::DateTime<Utc>,
    method: AuthMethod,
}

#[derive(Debug)]
struct RuntimeState {
    secure_state: SecureState,
    vault: Option<VaultData>,
    session: Option<SessionState>,
}

pub struct AppState {
    paths: StoragePaths,
    inner: Mutex<RuntimeState>,
}

impl AppState {
    pub fn new() -> Result<Self, AppError> {
        let paths = StoragePaths::new()?;
        storage::ensure_layout(&paths)?;
        let secure_state = storage::read_or_create_secure_state(&paths)?;

        Ok(Self {
            paths,
            inner: Mutex::new(RuntimeState {
                secure_state,
                vault: None,
                session: None,
            }),
        })
    }

    pub fn bootstrap_status(&self) -> Result<BootstrapStatus, AppError> {
        let runtime = self.inner.lock()?;

        Ok(BootstrapStatus {
            initialized: runtime.secure_state.initialized,
            session_locked: runtime.session.is_none(),
            secure_storage_ready: true,
            failed_attempts: runtime.secure_state.failed_attempts,
            failed_attempt_threshold: runtime.secure_state.failed_attempt_threshold,
            lock_reason: runtime.secure_state.last_lock_reason.clone(),
            locked_until: runtime.secure_state.locked_until,
        })
    }

    pub fn setup_master_pin(&self, input: SetupPinInput) -> Result<HydratedAppState, AppError> {
        security::validate_pin_strength(&input.pin)?;

        if input.pin != input.confirm_pin {
            return Err(AppError::context(
                "app_state::setup_master_pin",
                "La confirmación del PIN no coincide.",
            ));
        }

        let mut runtime = self.inner.lock()?;
        if runtime.secure_state.initialized {
            return Err(AppError::context(
                "app_state::setup_master_pin",
                "La bóveda ya fue inicializada.",
            ));
        }

        let hash = security::hash_pin(&input.pin)?;
        let encryption_salt = security::generate_encryption_salt();
        let key = security::derive_key(&input.pin, &encryption_salt)?;

        let mut vault = VaultData::default();
        push_event(
            &mut vault.events,
            SecurityEvent::new(
                "auth",
                Severity::Success,
                "Credencial maestra creada",
                "La bóveda local fue inicializada y cifrada correctamente.",
            ),
        );

        runtime.secure_state.initialized = true;
        runtime.secure_state.pin_hash = Some(hash);
        runtime.secure_state.encryption_salt = Some(encryption_salt);
        runtime.secure_state.failed_attempts = 0;
        runtime.secure_state.failed_attempt_threshold = vault.settings.failed_attempt_threshold;
        runtime.secure_state.locked_until = None;
        runtime.secure_state.emergency_mode = vault.settings.emergency_mode;
        runtime.secure_state.last_lock_reason = None;
        runtime.secure_state.pending_events.clear();
        runtime.secure_state.updated_at = Utc::now();

        runtime.session = Some(SessionState {
            key: Zeroizing::new(key),
            unlocked_at: Utc::now(),
            method: AuthMethod::Pin,
        });
        runtime.vault = Some(vault);

        self.persist_state(&runtime)?;
        self.persist_vault(&runtime)?;

        self.hydrated_from_runtime(&runtime)
    }

    pub fn unlock_session(
        &self,
        pin: String,
        method: AuthMethod,
    ) -> Result<HydratedAppState, AppError> {
        let mut runtime = self.inner.lock()?;

        if !runtime.secure_state.initialized {
            return Err(AppError::NotInitialized);
        }

        if let Some(locked_until) = runtime.secure_state.locked_until {
            if locked_until > Utc::now() {
                return Err(AppError::context(
                    "app_state::unlock_session",
                    format!(
                        "La sesión se encuentra temporalmente bloqueada hasta {}.",
                        locked_until
                    ),
                ));
            }
        }

        let hash = runtime
            .secure_state
            .pin_hash
            .clone()
            .ok_or(AppError::NotInitialized)?;

        let verified = security::verify_pin(&pin, &hash)?;
        if !verified {
            runtime.secure_state.failed_attempts =
                runtime.secure_state.failed_attempts.saturating_add(1);
            runtime.secure_state.updated_at = Utc::now();

            let mut event = SecurityEvent::new(
                "auth",
                Severity::Warning,
                "Intento fallido de autenticación",
                "Se ingresó un PIN incorrecto para desbloquear la sesión.",
            );
            event.metadata.insert(
                "failedAttempts".to_string(),
                runtime.secure_state.failed_attempts.to_string(),
            );
            push_event(&mut runtime.secure_state.pending_events, event);

            let remaining = runtime
                .secure_state
                .failed_attempt_threshold
                .saturating_sub(runtime.secure_state.failed_attempts);

            if runtime.secure_state.failed_attempts
                >= runtime.secure_state.failed_attempt_threshold
            {
                runtime.secure_state.locked_until =
                    Some(Utc::now() + Duration::minutes(LOCKOUT_MINUTES));
                runtime.secure_state.last_lock_reason = Some(
                    "Bloqueo preventivo por múltiples intentos fallidos.".to_string(),
                );
            }

            self.persist_state(&runtime)?;

            return Err(AppError::context(
                "app_state::unlock_session",
                format!("PIN inválido. Intentos restantes: {}.", remaining),
            ));
        }

        let encryption_salt = runtime
            .secure_state
            .encryption_salt
            .clone()
            .ok_or(AppError::NotInitialized)?;

        let key = security::derive_key(&pin, &encryption_salt)?;
        let blob = storage::read_vault_blob(&self.paths)?;
        let mut vault = security::decrypt_vault(&blob, &key)?;

        if !runtime.secure_state.pending_events.is_empty() {
            let pending = std::mem::take(&mut runtime.secure_state.pending_events);
            for event in pending.into_iter().rev() {
                push_event(&mut vault.events, event);
            }
        }

        runtime.secure_state.failed_attempts = 0;
        runtime.secure_state.locked_until = None;
        runtime.secure_state.last_lock_reason = None;
        runtime.secure_state.updated_at = Utc::now();

        runtime.session = Some(SessionState {
            key: Zeroizing::new(key),
            unlocked_at: Utc::now(),
            method,
        });

        push_event(
            &mut vault.events,
            SecurityEvent::new(
                "auth",
                Severity::Success,
                "Sesión desbloqueada",
                "La bóveda cifrada se montó en memoria y quedó lista para operar.",
            ),
        );
        runtime.vault = Some(vault);

        self.persist_state(&runtime)?;
        self.persist_vault(&runtime)?;
        self.hydrated_from_runtime(&runtime)
    }

    pub fn lock_session(&self, reason: Option<String>) -> Result<BootstrapStatus, AppError> {
        let mut runtime = self.inner.lock()?;

        if let Some(vault) = runtime.vault.as_mut() {
            let message = reason
                .clone()
                .unwrap_or_else(|| "Sesión bloqueada manualmente.".to_string());
            push_event(
                &mut vault.events,
                SecurityEvent::new(
                    "auth",
                    Severity::Info,
                    "Sesión bloqueada",
                    message,
                ),
            );
            self.persist_vault(&runtime)?;
        }

        if let Some(session) = runtime.session.as_mut() {
            session.key.zeroize();
        }

        runtime.session = None;
        runtime.vault = None;
        runtime.secure_state.last_lock_reason = reason;
        runtime.secure_state.updated_at = Utc::now();

        self.persist_state(&runtime)?;
        drop(runtime);
        self.bootstrap_status()
    }

    pub fn hydrate_state(&self) -> Result<HydratedAppState, AppError> {
        let runtime = self.inner.lock()?;
        self.hydrated_from_runtime(&runtime)
    }

    pub fn add_protected_item(
        &self,
        input: AddProtectedItemInput,
    ) -> Result<HydratedAppState, AppError> {
        let mut runtime = self.inner.lock()?;
        let vault = runtime.vault.as_mut().ok_or(AppError::SessionLocked)?;

        let item = integrity::create_item(
            &input.path,
            input.kind,
            input.protection_level,
            input.note.clone(),
        )?;

        if vault.items.iter().any(|existing| existing.path == item.path) {
            return Err(AppError::context(
                "app_state::add_protected_item",
                format!("La ruta ya está registrada: {}", item.path),
            ));
        }

        integrity::apply_lock_state(&item.path, item.kind, true)?;

        let mut event = SecurityEvent::new(
            "vault",
            Severity::Success,
            "Activo protegido agregado",
            "Se incorporó un archivo o carpeta al inventario seguro.",
        );
        event.path = Some(item.path.clone());
        event
            .metadata
            .insert("protectionLevel".to_string(), format!("{:?}", item.protection_level));

        vault.items.insert(0, item);
        push_event(&mut vault.events, event);

        self.persist_vault(&runtime)?;
        self.hydrated_from_runtime(&runtime)
    }

    pub fn remove_protected_items(&self, ids: Vec<String>) -> Result<HydratedAppState, AppError> {
        let mut runtime = self.inner.lock()?;
        let vault = runtime.vault.as_mut().ok_or(AppError::SessionLocked)?;

        let mut removed_paths = Vec::new();
        let mut retained = Vec::new();

        for item in vault.items.drain(..) {
            if ids.iter().any(|id| id == &item.id) {
                let _ = integrity::apply_lock_state(&item.path, item.kind, false);
                removed_paths.push(item.path);
            } else {
                retained.push(item);
            }
        }

        vault.items = retained;

        let mut event = SecurityEvent::new(
            "vault",
            if removed_paths.is_empty() {
                Severity::Info
            } else {
                Severity::Warning
            },
            "Elementos retirados del inventario",
            format!("Se retiraron {} elemento(s) del registro protegido.", removed_paths.len()),
        );
        if let Some(first) = removed_paths.first() {
            event.path = Some(first.clone());
        }

        push_event(&mut vault.events, event);

        self.persist_vault(&runtime)?;
        self.hydrated_from_runtime(&runtime)
    }

    pub fn set_items_locked(
        &self,
        ids: Vec<String>,
        locked: bool,
    ) -> Result<HydratedAppState, AppError> {
        let mut runtime = self.inner.lock()?;
        let vault = runtime.vault.as_mut().ok_or(AppError::SessionLocked)?;
        let mut changed = 0_usize;

        for item in &mut vault.items {
            if ids.iter().any(|id| id == &item.id) {
                integrity::apply_lock_state(&item.path, item.kind, locked)?;
                item.locked = locked;
                item.updated_at = Utc::now();
                changed += 1;
            }
        }

        push_event(
            &mut vault.events,
            SecurityEvent::new(
                "vault",
                Severity::Info,
                if locked {
                    "Bloqueo aplicado"
                } else {
                    "Bloqueo retirado"
                },
                format!("Se actualizó el estado de bloqueo de {} elemento(s).", changed),
            ),
        );

        self.persist_vault(&runtime)?;
        self.hydrated_from_runtime(&runtime)
    }

    pub fn rescan_integrity(&self) -> Result<HydratedAppState, AppError> {
        let mut runtime = self.inner.lock()?;
        let vault = runtime.vault.as_mut().ok_or(AppError::SessionLocked)?;

        let mut changed = 0_usize;
        let mut missing = 0_usize;

        for item in &mut vault.items {
            match integrity::refresh_item(item)? {
                IntegrityStatus::Verified => {}
                IntegrityStatus::Changed => changed += 1,
                IntegrityStatus::Missing => missing += 1,
            }
        }

        vault.last_scan_at = Some(Utc::now());
        push_event(
            &mut vault.events,
            SecurityEvent::new(
                "integrity",
                if missing > 0 {
                    Severity::Critical
                } else if changed > 0 {
                    Severity::Warning
                } else {
                    Severity::Success
                },
                "Escaneo de integridad finalizado",
                format!(
                    "Verificados: {} | Modificados: {} | Faltantes: {}.",
                    vault.items.len().saturating_sub(changed + missing),
                    changed,
                    missing
                ),
            ),
        );

        self.persist_vault(&runtime)?;
        self.hydrated_from_runtime(&runtime)
    }

    pub fn update_security_settings(
        &self,
        input: UpdateSettingsInput,
    ) -> Result<HydratedAppState, AppError> {
        let mut runtime = self.inner.lock()?;
        let updated_at = Utc::now();
        let (failed_attempt_threshold, emergency_mode) = {
            let vault = runtime.vault.as_mut().ok_or(AppError::SessionLocked)?;
            let settings = &mut vault.settings;

            if let Some(theme) = input.theme {
                settings.theme = theme;
            }

            if let Some(auto_lock_minutes) = input.auto_lock_minutes {
                settings.auto_lock_minutes = auto_lock_minutes.clamp(1, 120);
            }

            if let Some(camera_module_enabled) = input.camera_module_enabled {
                settings.camera_module_enabled = camera_module_enabled;
            }

            if let Some(failed_attempt_threshold) = input.failed_attempt_threshold {
                settings.failed_attempt_threshold = failed_attempt_threshold.clamp(3, 15);
            }

            if let Some(emergency_mode) = input.emergency_mode {
                settings.emergency_mode = emergency_mode;
            }

            if let Some(locale) = input.locale {
                if !locale.trim().is_empty() {
                    settings.locale = locale.trim().to_string();
                }
            }

            if let Some(default_roots) = input.default_roots {
                settings.default_roots = default_roots
                    .into_iter()
                    .filter(|value| !value.trim().is_empty())
                    .collect();
            }

            push_event(
                &mut vault.events,
                SecurityEvent::new(
                    "system",
                    Severity::Info,
                    "Políticas actualizadas",
                    "Las preferencias de seguridad fueron persistidas localmente.",
                ),
            );

            (
                settings.failed_attempt_threshold,
                settings.emergency_mode,
            )
        };

        runtime.secure_state.failed_attempt_threshold = failed_attempt_threshold;
        runtime.secure_state.emergency_mode = emergency_mode;
        runtime.secure_state.updated_at = updated_at;

        self.persist_state(&runtime)?;
        self.persist_vault(&runtime)?;
        self.hydrated_from_runtime(&runtime)
    }

    pub fn rotate_pin(&self, input: RotatePinInput) -> Result<HydratedAppState, AppError> {
        security::validate_pin_strength(&input.next_pin)?;

        if input.next_pin != input.confirm_pin {
            return Err(AppError::context(
                "app_state::rotate_pin",
                "La confirmación del nuevo PIN no coincide.",
            ));
        }

        let mut runtime = self.inner.lock()?;
        let hash = runtime
            .secure_state
            .pin_hash
            .clone()
            .ok_or(AppError::NotInitialized)?;

        let verified = security::verify_pin(&input.current_pin, &hash)?;
        if !verified {
            return Err(AppError::context(
                "app_state::rotate_pin",
                "El PIN actual no es válido.",
            ));
        }

        let new_hash = security::hash_pin(&input.next_pin)?;
        let new_salt = security::generate_encryption_salt();
        let new_key = security::derive_key(&input.next_pin, &new_salt)?;

        let vault = runtime.vault.as_mut().ok_or(AppError::SessionLocked)?;
        push_event(
            &mut vault.events,
            SecurityEvent::new(
                "auth",
                Severity::Success,
                "Credencial rotada",
                "La bóveda fue re-cifrada con una nueva credencial maestra.",
            ),
        );

        runtime.secure_state.pin_hash = Some(new_hash);
        runtime.secure_state.encryption_salt = Some(new_salt);
        runtime.secure_state.updated_at = Utc::now();

        runtime.session = Some(SessionState {
            key: Zeroizing::new(new_key),
            unlocked_at: Utc::now(),
            method: AuthMethod::Pin,
        });

        self.persist_state(&runtime)?;
        self.persist_vault(&runtime)?;
        self.hydrated_from_runtime(&runtime)
    }

    pub fn register_camera_event(
        &self,
        input: RegisterCameraEventInput,
    ) -> Result<HydratedAppState, AppError> {
        let mut runtime = self.inner.lock()?;
        let vault = runtime.vault.as_mut().ok_or(AppError::SessionLocked)?;

        let mut event = SecurityEvent::new(
            "camera",
            input.severity,
            input.title,
            input.description,
        );

        if let Some(gesture) = input.detected_gesture {
            event.metadata.insert("gesture".to_string(), gesture);
        }

        if let Some(suspected_intrusion) = input.suspected_intrusion {
            event.metadata.insert(
                "suspectedIntrusion".to_string(),
                suspected_intrusion.to_string(),
            );
        }

        push_event(&mut vault.events, event);
        self.persist_vault(&runtime)?;
        self.hydrated_from_runtime(&runtime)
    }

    pub fn trigger_emergency_lock(&self, reason: String) -> Result<BootstrapStatus, AppError> {
        let mut runtime = self.inner.lock()?;

        let event = SecurityEvent::new(
            "system",
            Severity::Critical,
            "Bloqueo de emergencia",
            reason.clone(),
        );

        if let Some(vault) = runtime.vault.as_mut() {
            push_event(&mut vault.events, event);
            self.persist_vault(&runtime)?;
        } else {
            push_event(&mut runtime.secure_state.pending_events, event);
        }

        if let Some(session) = runtime.session.as_mut() {
            session.key.zeroize();
        }

        runtime.session = None;
        runtime.vault = None;
        runtime.secure_state.last_lock_reason = Some(reason);
        runtime.secure_state.updated_at = Utc::now();

        self.persist_state(&runtime)?;
        drop(runtime);
        self.bootstrap_status()
    }

    pub fn export_security_events(
        &self,
        destination: Option<String>,
    ) -> Result<String, AppError> {
        let runtime = self.inner.lock()?;
        let vault = runtime.vault.as_ref().ok_or(AppError::SessionLocked)?;
        let destination = destination.map(PathBuf::from);

        let target = storage::export_events(&self.paths, &vault.events, destination)?;
        Ok(target.to_string_lossy().to_string())
    }

    fn persist_state(&self, runtime: &RuntimeState) -> Result<(), AppError> {
        storage::write_secure_state(&self.paths, &runtime.secure_state)
    }

    fn persist_vault(&self, runtime: &RuntimeState) -> Result<(), AppError> {
        let vault = runtime.vault.as_ref().ok_or(AppError::SessionLocked)?;
        let session = runtime.session.as_ref().ok_or(AppError::SessionLocked)?;

        let blob = security::encrypt_vault(vault, session.key.as_slice())?;
        storage::write_vault_blob(&self.paths, &blob)
    }

    fn hydrated_from_runtime(&self, runtime: &RuntimeState) -> Result<HydratedAppState, AppError> {
        let vault = runtime.vault.as_ref().ok_or(AppError::SessionLocked)?;
        let session = runtime.session.as_ref().ok_or(AppError::SessionLocked)?;

        let mut items = vault.items.clone();
        items.sort_by(|left, right| right.updated_at.cmp(&left.updated_at));

        let mut events = vault.events.clone();
        events.sort_by(|left, right| right.timestamp.cmp(&left.timestamp));

        let overview = build_overview(vault, &runtime.secure_state, runtime.session.is_some());

        Ok(HydratedAppState {
            overview,
            items,
            events,
            settings: vault.settings.clone(),
            session: Some(SessionSnapshot {
                unlocked_at: session.unlocked_at,
                method: session.method,
            }),
        })
    }
}

fn build_overview(vault: &VaultData, secure: &SecureState, session_active: bool) -> OverviewMetrics {
    let changed = vault
        .items
        .iter()
        .filter(|item| item.integrity_status == IntegrityStatus::Changed)
        .count();

    let missing = vault
        .items
        .iter()
        .filter(|item| item.integrity_status == IntegrityStatus::Missing)
        .count();

    let locked_items = vault.items.iter().filter(|item| item.locked).count();
    let alerts_from_events = vault
        .events
        .iter()
        .filter(|event| matches!(event.severity, Severity::Warning | Severity::Critical))
        .count();
    let recent_cutoff = Utc::now() - Duration::hours(24);
    let recent_activity = vault
        .events
        .iter()
        .filter(|event| event.timestamp >= recent_cutoff)
        .count();

    let alert_count = alerts_from_events + changed + missing;
    let unlocked_items = vault.items.len().saturating_sub(locked_items);
    let mut risk_score = (changed * 20 + missing * 35 + alert_count * 4 + unlocked_items * 6)
        as u32
        + secure.failed_attempts.saturating_mul(4);

    if !vault.settings.emergency_mode {
        risk_score = risk_score.saturating_add(5);
    }

    if vault.last_scan_at.is_none() && !vault.items.is_empty() {
        risk_score = risk_score.saturating_add(10);
    }

    risk_score = risk_score.min(100);

    let risk_label = match risk_score {
        0..=24 => RiskLabel::Low,
        25..=49 => RiskLabel::Moderate,
        50..=74 => RiskLabel::High,
        _ => RiskLabel::Critical,
    };

    OverviewMetrics {
        protected_items: vault.items.len(),
        locked_items,
        alert_count,
        risk_score,
        risk_label,
        encryption_status: if session_active {
            EncryptionStatus::Unlocked
        } else {
            EncryptionStatus::Sealed
        },
        last_scan_at: vault.last_scan_at,
        recent_activity,
        camera_status: if vault.settings.camera_module_enabled {
            CameraStatus::Ready
        } else {
            CameraStatus::Disabled
        },
    }
}

fn push_event(events: &mut Vec<SecurityEvent>, event: SecurityEvent) {
    events.insert(0, event);
    if events.len() > MAX_EVENTS {
        events.truncate(MAX_EVENTS);
    }
}
