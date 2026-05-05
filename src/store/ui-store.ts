import { create } from "zustand";
import type { ThemeMode, ToastMessage } from "@/types/security";

interface UiState {
  theme: ThemeMode;
  toasts: ToastMessage[];
  sidebarCollapsed: boolean;
  commandPaletteShortcut: string;
  settingsSections: Record<string, boolean>;
  setTheme: (theme: ThemeMode) => void;
  applyTheme: (theme: ThemeMode) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteShortcut: (value: string) => void;
  setSettingsSectionOpen: (key: string, open: boolean) => void;
  toggleSettingsSection: (key: string) => void;
  pushToast: (toast: Omit<ToastMessage, "id"> & { id?: string }) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const STORAGE_KEY = "digipet.theme";
const SIDEBAR_KEY = "digipet.sidebar-collapsed";
const SHORTCUT_KEY = "digipet.shortcut.command-palette";
const SETTINGS_KEY = "digipet.settings.sections";

function resolveStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === "dark" || value === "light" || value === "system") return value;
  return "dark";
}

function syncTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const prefersDark = theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const darkMode = theme === "dark" || prefersDark;
  root.classList.toggle("dark", darkMode);
  root.dataset.theme = theme;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }
}

function resolveSidebarState() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SIDEBAR_KEY) === "true";
}

function resolveShortcut() {
  if (typeof window === "undefined") return "Ctrl+K";
  return window.localStorage.getItem(SHORTCUT_KEY) ?? "Ctrl+K";
}

function resolveSections() {
  if (typeof window === "undefined") {
    return {
      session: true,
      devices: false,
      controls: true,
      preferences: false,
      methods: false,
      advanced: false,
    };
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        session: true,
        devices: false,
        controls: true,
        preferences: false,
        methods: false,
        advanced: false,
      };
    }
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {
      session: true,
      devices: false,
      controls: true,
      preferences: false,
      methods: false,
      advanced: false,
    };
  }
}

export const useUiStore = create<UiState>((set) => ({
  theme: resolveStoredTheme(),
  toasts: [],
  sidebarCollapsed: resolveSidebarState(),
  commandPaletteShortcut: resolveShortcut(),
  settingsSections: resolveSections(),
  setTheme: (theme) => {
    syncTheme(theme);
    set({ theme });
  },
  applyTheme: (theme) => {
    syncTheme(theme);
  },
  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    }
    set({ sidebarCollapsed: collapsed });
  },
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_KEY, String(next));
      }
      return { sidebarCollapsed: next };
    }),
  setCommandPaletteShortcut: (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SHORTCUT_KEY, value);
    }
    set({ commandPaletteShortcut: value });
  },
  setSettingsSectionOpen: (key, open) =>
    set((state) => {
      const next = { ...state.settingsSections, [key]: open };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      }
      return { settingsSections: next };
    }),
  toggleSettingsSection: (key) =>
    set((state) => {
      const next = { ...state.settingsSections, [key]: !state.settingsSections[key] };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      }
      return { settingsSections: next };
    }),
  pushToast: (toast) => {
    const id = toast.id ?? crypto.randomUUID();
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          durationMs: 4200,
          variant: "info",
          ...toast,
          id,
        },
      ],
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));
