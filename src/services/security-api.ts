import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import type {
  AddProtectedItemInput,
  AuthMethod,
  BootstrapStatus,
  HydratedAppState,
  RegisterCameraEventInput,
  RotatePinInput,
  SetupPinInput,
  UpdateSettingsInput
} from "@/types/security";

export function bootstrap() {
  return invoke<BootstrapStatus>("bootstrap");
}

export function setupMasterPin(input: SetupPinInput) {
  return invoke<HydratedAppState>("setup_master_pin", { input });
}

export function unlockSession(pin: string, method: AuthMethod = "pin") {
  return invoke<HydratedAppState>("unlock_session", { pin, method });
}

export function lockSession(reason?: string) {
  return invoke<BootstrapStatus>("lock_session", { reason });
}

export function hydrateState() {
  return invoke<HydratedAppState>("hydrate_state");
}

export function addProtectedItem(input: AddProtectedItemInput) {
  return invoke<HydratedAppState>("add_protected_item", { input });
}

export function removeProtectedItems(ids: string[]) {
  return invoke<HydratedAppState>("remove_protected_items", { ids });
}

export function setItemsLocked(ids: string[], locked: boolean) {
  return invoke<HydratedAppState>("set_items_locked", { ids, locked });
}

export function rescanIntegrity() {
  return invoke<HydratedAppState>("rescan_integrity");
}

export function updateSecuritySettings(input: UpdateSettingsInput) {
  return invoke<HydratedAppState>("update_security_settings", { input });
}

export function rotatePin(input: RotatePinInput) {
  return invoke<HydratedAppState>("rotate_pin", { input });
}

export function registerCameraEvent(input: RegisterCameraEventInput) {
  return invoke<HydratedAppState>("register_camera_event", { input });
}

export function triggerEmergencyLock(reason: string) {
  return invoke<BootstrapStatus>("trigger_emergency_lock", { reason });
}

export function exportSecurityEvents(destination?: string) {
  return invoke<string>("export_security_events", { destination });
}

export async function pickFiles() {
  const selected = await open({
    title: "Selecciona archivos para proteger",
    multiple: true,
    directory: false
  });

  if (!selected) return [];
  return Array.isArray(selected) ? selected : [selected];
}

export async function pickDirectory() {
  const selected = await open({
    title: "Selecciona una carpeta para proteger",
    multiple: false,
    directory: true
  });

  if (!selected) return null;
  return Array.isArray(selected) ? selected[0] : selected;
}

export async function pickExportDestination() {
  return save({
    title: "Exportar historial de DigiPET",
    defaultPath: "digipet-security-events.json",
    filters: [
      {
        name: "JSON",
        extensions: ["json"]
      }
    ]
  });
}
