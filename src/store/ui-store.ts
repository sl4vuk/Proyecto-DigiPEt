import { create } from "zustand";
import type { ThemeMode, ToastMessage } from "@/types/security";

interface UiState {
  theme: ThemeMode;
  toasts: ToastMessage[];
  sidebarCollapsed: boolean;
  setTheme: (theme: ThemeMode) => void;
  applyTheme: (theme: ThemeMode) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  pushToast: (toast: Omit<ToastMessage, "id"> & { id?: string }) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const STORAGE_KEY = "digipet.theme";
const SIDEBAR_KEY = "digipet.sidebar-collapsed";

function resolveStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === "dark" || value === "light" || value === "system") {
    return value;
  }

  return "dark";
}

function syncTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const prefersDark =
    theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
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

export const useUiStore = create<UiState>((set) => ({
  theme: resolveStoredTheme(),
  toasts: [],
  sidebarCollapsed: resolveSidebarState(),
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
  pushToast: (toast) => {
    const id = toast.id ?? crypto.randomUUID();
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          durationMs: 4200,
          variant: "info",
          ...toast,
          id
        }
      ]
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    })),
  clearToasts: () => set({ toasts: [] })
}));
