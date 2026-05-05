use std::{env, process::Command};

use tauri::State;

use crate::{
    app_state::AppState,
    models::{
        AddProtectedItemInput, AuthMethod, BootstrapStatus, HydratedAppState,
        RegisterCameraEventInput, RotatePinInput, SetupPinInput, SystemInfoPayload,
        TerminalCommandResult, TerminalStatus, UpdateSettingsInput,
    },
    system_info,
};

#[tauri::command]
pub fn bootstrap(state: State<'_, AppState>) -> Result<BootstrapStatus, String> {
    state.bootstrap_status().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn setup_master_pin(state: State<'_, AppState>, input: SetupPinInput) -> Result<HydratedAppState, String> {
    state.setup_master_pin(input).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn unlock_session(state: State<'_, AppState>, pin: String, method: AuthMethod) -> Result<HydratedAppState, String> {
    state.unlock_session(pin, method).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn lock_session(state: State<'_, AppState>, reason: Option<String>) -> Result<BootstrapStatus, String> {
    state.lock_session(reason).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn hydrate_state(state: State<'_, AppState>) -> Result<HydratedAppState, String> {
    state.hydrate_state().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn add_protected_item(state: State<'_, AppState>, input: AddProtectedItemInput) -> Result<HydratedAppState, String> {
    state.add_protected_item(input).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn remove_protected_items(state: State<'_, AppState>, ids: Vec<String>) -> Result<HydratedAppState, String> {
    state.remove_protected_items(ids).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_items_locked(state: State<'_, AppState>, ids: Vec<String>, locked: bool) -> Result<HydratedAppState, String> {
    state.set_items_locked(ids, locked).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn rescan_integrity(state: State<'_, AppState>) -> Result<HydratedAppState, String> {
    state.rescan_integrity().map_err(|error| error.to_string())
}

#[tauri::command]
pub fn update_security_settings(state: State<'_, AppState>, input: UpdateSettingsInput) -> Result<HydratedAppState, String> {
    state.update_security_settings(input).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn rotate_pin(state: State<'_, AppState>, input: RotatePinInput) -> Result<HydratedAppState, String> {
    state.rotate_pin(input).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn register_camera_event(state: State<'_, AppState>, input: RegisterCameraEventInput) -> Result<HydratedAppState, String> {
    state.register_camera_event(input).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn trigger_emergency_lock(state: State<'_, AppState>, reason: String) -> Result<BootstrapStatus, String> {
    state.trigger_emergency_lock(reason).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn export_security_events(state: State<'_, AppState>, destination: Option<String>) -> Result<String, String> {
    state.export_security_events(destination).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfoPayload, String> {
    system_info::get_system_info()
}

#[tauri::command]
pub fn get_network_info() -> Result<SystemInfoPayload, String> {
    system_info::get_network_info()
}

#[tauri::command]
pub fn get_current_user() -> Result<String, String> {
    system_info::get_current_user()
}

#[tauri::command]
pub fn get_hostname() -> Result<String, String> {
    system_info::get_hostname()
}

#[tauri::command]
pub fn get_os_info() -> Result<String, String> {
    system_info::get_os_info()
}

#[tauri::command]
pub fn get_local_ip() -> Result<String, String> {
    system_info::get_local_ip()
}

#[tauri::command]
pub fn get_mac_addresses() -> Result<Vec<String>, String> {
    system_info::get_mac_addresses()
}

#[tauri::command]
pub fn terminal_status() -> Result<TerminalStatus, String> {
    Ok(TerminalStatus {
        available: true,
        mode: "ready".to_string(),
        requires_whitelist: true,
        message: "Terminal allowlist lista para ejecutar comandos seguros.".to_string(),
        allowlist: vec![
            "dir".to_string(),
            "pwd".to_string(),
            "whoami".to_string(),
            "hostname".to_string(),
            "ipconfig".to_string(),
            "getmac".to_string(),
            "ver".to_string(),
            "systeminfo".to_string(),
            "git status".to_string(),
            "git branch".to_string(),
            "git log --oneline -5".to_string(),
        ],
    })
}

#[tauri::command]
pub fn run_terminal_command(command: String) -> Result<TerminalCommandResult, String> {
    let normalized = command.trim().to_lowercase();
    if normalized.is_empty() {
        return Err("Debes ingresar un comando.".to_string());
    }

    let dangerous_tokens = ["&&", "||", ";", "|", ">", "<", "`", "$ (", "rm", "del", "format", "shutdown", "powershell -enc", "curl", "wget", "$ (" ];
    if dangerous_tokens.iter().any(|token| normalized.contains(token)) {
        return Err("Comando no permitido por allowlist.".to_string());
    }

    let allowlist = [
        "dir",
        "pwd",
        "whoami",
        "hostname",
        "ipconfig",
        "getmac",
        "ver",
        "systeminfo",
        "git status",
        "git branch",
        "git log --oneline -5",
    ];

    if !allowlist.iter().any(|allowed| *allowed == normalized) {
        return Err("Comando no permitido por allowlist.".to_string());
    }

    let cwd = env::current_dir().ok().map(|path| path.to_string_lossy().to_string());

    #[cfg(target_os = "windows")]
    let output = Command::new("powershell.exe")
        .args(["-NoProfile", "-Command", &command])
        .output()
        .map_err(|error| error.to_string())?;

    #[cfg(not(target_os = "windows"))]
    let output = Command::new("sh")
        .args(["-lc", &command])
        .output()
        .map_err(|error| error.to_string())?;

    Ok(TerminalCommandResult {
        ok: output.status.success(),
        command,
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
        cwd,
    })
}
