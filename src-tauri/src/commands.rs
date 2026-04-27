use tauri::State;

use crate::{
    app_state::AppState,
    models::{
        AddProtectedItemInput, AuthMethod, BootstrapStatus, HydratedAppState,
        RegisterCameraEventInput, RotatePinInput, SetupPinInput, TerminalCommandResult,
        TerminalStatus, UpdateSettingsInput,
    },
};

#[tauri::command]
pub fn bootstrap(state: State<'_, AppState>) -> Result<BootstrapStatus, String> {
    state.bootstrap_status().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn setup_master_pin(
    state: State<'_, AppState>,
    input: SetupPinInput,
) -> Result<HydratedAppState, String> {
    state
        .setup_master_pin(input)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn unlock_session(
    state: State<'_, AppState>,
    pin: String,
    method: AuthMethod,
) -> Result<HydratedAppState, String> {
    state
        .unlock_session(pin, method)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn lock_session(
    state: State<'_, AppState>,
    reason: Option<String>,
) -> Result<BootstrapStatus, String> {
    state.lock_session(reason).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn hydrate_state(state: State<'_, AppState>) -> Result<HydratedAppState, String> {
    state.hydrate_state().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn add_protected_item(
    state: State<'_, AppState>,
    input: AddProtectedItemInput,
) -> Result<HydratedAppState, String> {
    state
        .add_protected_item(input)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn remove_protected_items(
    state: State<'_, AppState>,
    ids: Vec<String>,
) -> Result<HydratedAppState, String> {
    state
        .remove_protected_items(ids)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_items_locked(
    state: State<'_, AppState>,
    ids: Vec<String>,
    locked: bool,
) -> Result<HydratedAppState, String> {
    state
        .set_items_locked(ids, locked)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn rescan_integrity(state: State<'_, AppState>) -> Result<HydratedAppState, String> {
    state.rescan_integrity().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn update_security_settings(
    state: State<'_, AppState>,
    input: UpdateSettingsInput,
) -> Result<HydratedAppState, String> {
    state
        .update_security_settings(input)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn rotate_pin(
    state: State<'_, AppState>,
    input: RotatePinInput,
) -> Result<HydratedAppState, String> {
    state.rotate_pin(input).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn register_camera_event(
    state: State<'_, AppState>,
    input: RegisterCameraEventInput,
) -> Result<HydratedAppState, String> {
    state
        .register_camera_event(input)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn trigger_emergency_lock(
    state: State<'_, AppState>,
    reason: String,
) -> Result<BootstrapStatus, String> {
    state
        .trigger_emergency_lock(reason)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn export_security_events(
    state: State<'_, AppState>,
    destination: Option<String>,
) -> Result<String, String> {
    state
        .export_security_events(destination)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn terminal_status() -> Result<TerminalStatus, String> {
    Ok(TerminalStatus {
        available: false,
        mode: "stub".to_string(),
        requires_whitelist: true,
        message: "La ejecución real de comandos sigue deshabilitada hasta definir allowlist, permisos y auditoría por comando.".to_string(),
        allowlist: vec![
            "dir".to_string(),
            "pwd".to_string(),
            "whoami".to_string(),
            "git status".to_string(),
        ],
    })
}

#[tauri::command]
pub fn run_terminal_command(command: String) -> Result<TerminalCommandResult, String> {
    Ok(TerminalCommandResult {
        ok: false,
        command,
        output: "Stub seguro: la terminal aún no ejecuta comandos reales. La ejecución futura debe pasar por allowlist, permisos explícitos y trazabilidad de auditoría.".to_string(),
    })
}
