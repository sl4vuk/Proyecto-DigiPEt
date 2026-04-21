import { create } from "zustand";
import * as api from "@/services/security-api";
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
import { useUiStore } from "@/store/ui-store";

interface SecurityState {
  bootstrap: BootstrapStatus | null;
  hydrated: HydratedAppState | null;
  bootstrapping: boolean;
  busy: boolean;
  lastError: string | null;
  selectedIds: string[];
  loadBootstrap: () => Promise<void>;
  refreshHydrated: () => Promise<void>;
  setupPin: (input: SetupPinInput) => Promise<void>;
  unlock: (pin: string, method?: AuthMethod) => Promise<void>;
  lock: (reason?: string) => Promise<void>;
  addItem: (input: AddProtectedItemInput) => Promise<void>;
  removeItems: (ids: string[]) => Promise<void>;
  setItemsLocked: (ids: string[], locked: boolean) => Promise<void>;
  rescanIntegrity: () => Promise<void>;
  updateSettings: (input: UpdateSettingsInput) => Promise<void>;
  rotatePin: (input: RotatePinInput) => Promise<void>;
  exportEvents: (destination?: string) => Promise<string>;
  registerCameraEvent: (input: RegisterCameraEventInput) => Promise<void>;
  emergencyLock: (reason: string) => Promise<void>;
  setSelection: (ids: string[]) => void;
  clearError: () => void;
}

function normalizeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ocurrió un error inesperado en la operación segura.";
}

function syncHydrated(hydrated: HydratedAppState, previousBootstrap?: BootstrapStatus | null) {
  useUiStore.getState().setTheme(hydrated.settings.theme);

  return {
    hydrated,
    bootstrap: {
      initialized: true,
      sessionLocked: false,
      secureStorageReady: previousBootstrap?.secureStorageReady ?? true,
      failedAttempts: 0,
      failedAttemptThreshold: hydrated.settings.failedAttemptThreshold,
      lockReason: null,
      lockedUntil: null
    } satisfies BootstrapStatus,
    lastError: null
  };
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  bootstrap: null,
  hydrated: null,
  bootstrapping: true,
  busy: false,
  lastError: null,
  selectedIds: [],
  loadBootstrap: async () => {
    set({ bootstrapping: true, lastError: null });
    try {
      const bootstrap = await api.bootstrap();
      set({ bootstrap, bootstrapping: false });

      if (!bootstrap.sessionLocked && bootstrap.initialized) {
        const hydrated = await api.hydrateState();
        set(syncHydrated(hydrated, bootstrap));
      }
    } catch (error) {
      const message = normalizeError(error);
      set({ lastError: message, bootstrapping: false });
      useUiStore.getState().pushToast({
        title: "No se pudo iniciar el entorno seguro",
        description: message,
        variant: "critical"
      });
    }
  },
  refreshHydrated: async () => {
    try {
      const hydrated = await api.hydrateState();
      set(syncHydrated(hydrated, get().bootstrap));
    } catch (error) {
      const message = normalizeError(error);
      set({ lastError: message });
      throw error;
    }
  },
  setupPin: async (input) => {
    set({ busy: true, lastError: null });
    try {
      const hydrated = await api.setupMasterPin(input);
      set({
        ...syncHydrated(hydrated, get().bootstrap),
        busy: false,
        selectedIds: []
      });
      useUiStore.getState().pushToast({
        title: "Contenedor inicializado",
        description: "La bóveda local fue creada y cifrada con tu PIN maestro.",
        variant: "success"
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ busy: false, lastError: message });
      useUiStore.getState().pushToast({
        title: "No se pudo crear la bóveda",
        description: message,
        variant: "critical"
      });
      throw error;
    }
  },
  unlock: async (pin, method = "pin") => {
    set({ busy: true, lastError: null });
    try {
      const hydrated = await api.unlockSession(pin, method);
      set({
        ...syncHydrated(hydrated, get().bootstrap),
        busy: false,
        selectedIds: []
      });
      useUiStore.getState().pushToast({
        title: "Sesión segura iniciada",
        description: "El contenedor cifrado quedó montado en memoria.",
        variant: "success"
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ busy: false, lastError: message });
      await get().loadBootstrap();
      throw error;
    }
  },
  lock: async (reason) => {
    try {
      const bootstrap = await api.lockSession(reason);
      set({
        bootstrap,
        hydrated: null,
        selectedIds: [],
        lastError: null
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ lastError: message });
      useUiStore.getState().pushToast({
        title: "No se pudo bloquear la sesión",
        description: message,
        variant: "critical"
      });
    }
  },
  addItem: async (input) => {
    set({ busy: true, lastError: null });
    try {
      const hydrated = await api.addProtectedItem(input);
      set({
        ...syncHydrated(hydrated, get().bootstrap),
        busy: false
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ busy: false, lastError: message });
      throw error;
    }
  },
  removeItems: async (ids) => {
    if (!ids.length) return;

    set({ busy: true, lastError: null });
    try {
      const hydrated = await api.removeProtectedItems(ids);
      set({
        ...syncHydrated(hydrated, get().bootstrap),
        busy: false,
        selectedIds: []
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ busy: false, lastError: message });
      throw error;
    }
  },
  setItemsLocked: async (ids, locked) => {
    if (!ids.length) return;

    set({ busy: true, lastError: null });
    try {
      const hydrated = await api.setItemsLocked(ids, locked);
      set({
        ...syncHydrated(hydrated, get().bootstrap),
        busy: false
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ busy: false, lastError: message });
      throw error;
    }
  },
  rescanIntegrity: async () => {
    set({ busy: true, lastError: null });
    try {
      const hydrated = await api.rescanIntegrity();
      set({
        ...syncHydrated(hydrated, get().bootstrap),
        busy: false
      });
      useUiStore.getState().pushToast({
        title: "Escaneo finalizado",
        description: "La integridad local se actualizó correctamente.",
        variant: "success"
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ busy: false, lastError: message });
      throw error;
    }
  },
  updateSettings: async (input) => {
    set({ busy: true, lastError: null });
    try {
      const hydrated = await api.updateSecuritySettings(input);
      set({
        ...syncHydrated(hydrated, get().bootstrap),
        busy: false
      });
      useUiStore.getState().pushToast({
        title: "Ajustes guardados",
        description: "Las políticas locales fueron actualizadas.",
        variant: "success"
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ busy: false, lastError: message });
      throw error;
    }
  },
  rotatePin: async (input) => {
    set({ busy: true, lastError: null });
    try {
      const hydrated = await api.rotatePin(input);
      set({
        ...syncHydrated(hydrated, get().bootstrap),
        busy: false
      });
      useUiStore.getState().pushToast({
        title: "PIN rotado",
        description: "La bóveda fue re-cifrada con la nueva credencial.",
        variant: "success"
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ busy: false, lastError: message });
      throw error;
    }
  },
  exportEvents: async (destination) => {
    try {
      const path = await api.exportSecurityEvents(destination);
      useUiStore.getState().pushToast({
        title: "Historial exportado",
        description: path,
        variant: "success"
      });
      return path;
    } catch (error) {
      const message = normalizeError(error);
      set({ lastError: message });
      throw error;
    }
  },
  registerCameraEvent: async (input) => {
    try {
      const hydrated = await api.registerCameraEvent(input);
      set(syncHydrated(hydrated, get().bootstrap));
    } catch (error) {
      const message = normalizeError(error);
      set({ lastError: message });
      throw error;
    }
  },
  emergencyLock: async (reason) => {
    try {
      const bootstrap = await api.triggerEmergencyLock(reason);
      set({
        bootstrap,
        hydrated: null,
        selectedIds: [],
        lastError: null
      });
      useUiStore.getState().pushToast({
        title: "Bloqueo de emergencia",
        description: "La sesión quedó desmontada y el incidente fue registrado.",
        variant: "warning"
      });
    } catch (error) {
      const message = normalizeError(error);
      set({ lastError: message });
      throw error;
    }
  },
  setSelection: (ids) => set({ selectedIds: ids }),
  clearError: () => set({ lastError: null })
}));
