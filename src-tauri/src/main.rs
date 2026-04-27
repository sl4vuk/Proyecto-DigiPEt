mod app_state;
mod commands;
mod error;
mod integrity;
mod models;
mod security;
mod storage;

use app_state::AppState;

fn main() {
    let state = AppState::new().expect("failed to initialize secure runtime");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::bootstrap,
            commands::setup_master_pin,
            commands::unlock_session,
            commands::lock_session,
            commands::hydrate_state,
            commands::add_protected_item,
            commands::remove_protected_items,
            commands::set_items_locked,
            commands::rescan_integrity,
            commands::update_security_settings,
            commands::rotate_pin,
            commands::register_camera_event,
            commands::trigger_emergency_lock,
            commands::export_security_events,
            commands::terminal_status,
            commands::run_terminal_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
