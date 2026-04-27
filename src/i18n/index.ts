import { catalog, type SupportedLocale } from "@/i18n/catalog";
import { useSecurityStore } from "@/store/security-store";

const localeAliases: Record<string, SupportedLocale> = {
  "es": "es-PE",
  "es-PE": "es-PE",
  "es-ES": "es-PE",
  "en": "en-US",
  "en-US": "en-US"
};

export function resolveLocale(input?: string): SupportedLocale {
  if (!input) return "es-PE";
  return localeAliases[input] ?? "es-PE";
}

export function useI18n() {
  const locale = useSecurityStore((state) => resolveLocale(state.hydrated?.settings.locale));
  return catalog[locale];
}
