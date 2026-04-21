use std::collections::HashMap;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ThemeMode {
    Dark,
    Light,
    System,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Info,
    Warning,
    Critical,
    Success,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum RiskLabel {
    Low,
    Moderate,
    High,
    Critical,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum IntegrityStatus {
    Verified,
    Changed,
    Missing,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum EncryptionStatus {
    Sealed,
    Unlocked,
    Attention,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ProtectedItemKind {
    File,
    Directory,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ProtectionLevel {
    Standard,
    Strict,
    Isolation,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum AuthMethod {
    Pin,
    Camera,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum CameraStatus {
    Ready,
    Disabled,
    Unavailable,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapStatus {
    pub initialized: bool,
    pub session_locked: bool,
    pub secure_storage_ready: bool,
    pub failed_attempts: u32,
    pub failed_attempt_threshold: u32,
    pub lock_reason: Option<String>,
    pub locked_until: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecuritySettings {
    pub theme: ThemeMode,
    pub auto_lock_minutes: u32,
    pub camera_module_enabled: bool,
    pub failed_attempt_threshold: u32,
    pub emergency_mode: bool,
    pub locale: String,
    pub default_roots: Vec<String>,
}

impl Default for SecuritySettings {
    fn default() -> Self {
        Self {
            theme: ThemeMode::Dark,
            auto_lock_minutes: 10,
            camera_module_enabled: false,
            failed_attempt_threshold: 5,
            emergency_mode: true,
            locale: "es-PE".to_string(),
            default_roots: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProtectedItem {
    pub id: String,
    pub path: String,
    pub kind: ProtectedItemKind,
    pub size_bytes: u64,
    pub locked: bool,
    pub protection_level: ProtectionLevel,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_accessed_at: Option<DateTime<Utc>>,
    pub fingerprint: String,
    pub integrity_status: IntegrityStatus,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecurityEvent {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub category: String,
    pub severity: Severity,
    pub title: String,
    pub description: String,
    pub path: Option<String>,
    pub metadata: HashMap<String, String>,
}

impl SecurityEvent {
    pub fn new(
        category: impl Into<String>,
        severity: Severity,
        title: impl Into<String>,
        description: impl Into<String>,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            category: category.into(),
            severity,
            title: title.into(),
            description: description.into(),
            path: None,
            metadata: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionSnapshot {
    pub unlocked_at: DateTime<Utc>,
    pub method: AuthMethod,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OverviewMetrics {
    pub protected_items: usize,
    pub locked_items: usize,
    pub alert_count: usize,
    pub risk_score: u32,
    pub risk_label: RiskLabel,
    pub encryption_status: EncryptionStatus,
    pub last_scan_at: Option<DateTime<Utc>>,
    pub recent_activity: usize,
    pub camera_status: CameraStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HydratedAppState {
    pub overview: OverviewMetrics,
    pub items: Vec<ProtectedItem>,
    pub events: Vec<SecurityEvent>,
    pub settings: SecuritySettings,
    pub session: Option<SessionSnapshot>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultData {
    pub items: Vec<ProtectedItem>,
    pub events: Vec<SecurityEvent>,
    pub settings: SecuritySettings,
    pub last_scan_at: Option<DateTime<Utc>>,
}

impl Default for VaultData {
    fn default() -> Self {
        let mut events = Vec::new();
        events.push(SecurityEvent::new(
            "system",
            Severity::Info,
            "Vault listo",
            "Se creó la estructura inicial del contenedor seguro.",
        ));

        Self {
            items: Vec::new(),
            events,
            settings: SecuritySettings::default(),
            last_scan_at: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecureState {
    pub initialized: bool,
    pub pin_hash: Option<String>,
    pub encryption_salt: Option<String>,
    pub failed_attempts: u32,
    pub failed_attempt_threshold: u32,
    pub locked_until: Option<DateTime<Utc>>,
    pub emergency_mode: bool,
    pub last_lock_reason: Option<String>,
    pub pending_events: Vec<SecurityEvent>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Default for SecureState {
    fn default() -> Self {
        let now = Utc::now();
        Self {
            initialized: false,
            pin_hash: None,
            encryption_salt: None,
            failed_attempts: 0,
            failed_attempt_threshold: 5,
            locked_until: None,
            emergency_mode: true,
            last_lock_reason: Some("Sesión sellada al iniciar la aplicación.".to_string()),
            pending_events: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EncryptedVaultBlob {
    pub version: u8,
    pub nonce: String,
    pub ciphertext: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetupPinInput {
    pub pin: String,
    pub confirm_pin: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddProtectedItemInput {
    pub path: String,
    pub kind: ProtectedItemKind,
    pub protection_level: ProtectionLevel,
    pub note: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSettingsInput {
    pub theme: Option<ThemeMode>,
    pub auto_lock_minutes: Option<u32>,
    pub camera_module_enabled: Option<bool>,
    pub failed_attempt_threshold: Option<u32>,
    pub emergency_mode: Option<bool>,
    pub locale: Option<String>,
    pub default_roots: Option<Vec<String>>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RotatePinInput {
    pub current_pin: String,
    pub next_pin: String,
    pub confirm_pin: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterCameraEventInput {
    pub title: String,
    pub description: String,
    pub severity: Severity,
    pub detected_gesture: Option<String>,
    pub suspected_intrusion: Option<bool>,
}
