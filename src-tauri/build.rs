fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new().app_manifest(
            tauri_build::AppManifest::new().commands(&[
                "bootstrap",
                "setup_master_pin",
                "unlock_session",
                "lock_session",
                "hydrate_state",
                "add_protected_item",
                "remove_protected_items",
                "set_items_locked",
                "rescan_integrity",
                "update_security_settings",
                "rotate_pin",
                "register_camera_event",
                "trigger_emergency_lock",
                "export_security_events",
                "terminal_status",
                "run_terminal_command",
            ]),
        ),
    )
    .expect("failed to generate tauri build context");
}
