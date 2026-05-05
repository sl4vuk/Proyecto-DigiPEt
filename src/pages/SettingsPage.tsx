import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Globe2, Keyboard, MonitorCog, MoonStar, ShieldAlert, SlidersHorizontal, SunMedium } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActionButton } from "@/components/security/ActionButton";
import { SecurityControlsList } from "@/components/security/SecurityControlsList";
import { StatusChip } from "@/components/security/StatusChip";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { protectionOptions, securityControls } from "@/features/security/mock-data";
import { useUiStore } from "@/store/ui-store";
import { useSecurityStore } from "@/store/security-store";
import type { ThemeMode } from "@/types/security";

export function SettingsPage() {
  const navigate = useNavigate();
  const hydrated = useSecurityStore((state) => state.hydrated);
  const busy = useSecurityStore((state) => state.busy);
  const updateSettings = useSecurityStore((state) => state.updateSettings);
  const rotatePin = useSecurityStore((state) => state.rotatePin);
  const emergencyLock = useSecurityStore((state) => state.emergencyLock);
  const sections = useUiStore((state) => state.settingsSections);
  const toggleSection = useUiStore((state) => state.toggleSettingsSection);
  const shortcut = useUiStore((state) => state.commandPaletteShortcut);
  const setShortcut = useUiStore((state) => state.setCommandPaletteShortcut);

  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [autoLockMinutes, setAutoLockMinutes] = useState("5");
  const [failedAttemptThreshold, setFailedAttemptThreshold] = useState("5");
  const [cameraModuleEnabled, setCameraModuleEnabled] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [locale, setLocale] = useState("es-PE");
  const [currentPin, setCurrentPin] = useState("");
  const [nextPin, setNextPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    setTheme(hydrated.settings.theme);
    setAutoLockMinutes(String(hydrated.settings.autoLockMinutes));
    setFailedAttemptThreshold(String(hydrated.settings.failedAttemptThreshold));
    setCameraModuleEnabled(hydrated.settings.cameraModuleEnabled);
    setEmergencyMode(hydrated.settings.emergencyMode);
    setLocale(hydrated.settings.locale);
  }, [hydrated]);

  const hasChanges = useMemo(() => {
    if (!hydrated) return false;
    return theme !== hydrated.settings.theme || Number(autoLockMinutes) !== hydrated.settings.autoLockMinutes || Number(failedAttemptThreshold) !== hydrated.settings.failedAttemptThreshold || cameraModuleEnabled !== hydrated.settings.cameraModuleEnabled || emergencyMode !== hydrated.settings.emergencyMode || locale !== hydrated.settings.locale;
  }, [autoLockMinutes, cameraModuleEnabled, emergencyMode, failedAttemptThreshold, hydrated, locale, theme]);

  useEffect(() => {
    if (!hasChanges) return;
    const timeout = window.setTimeout(() => {
      void updateSettings({ theme, autoLockMinutes: Number(autoLockMinutes), failedAttemptThreshold: Number(failedAttemptThreshold), cameraModuleEnabled, emergencyMode, locale }).catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [autoLockMinutes, cameraModuleEnabled, emergencyMode, failedAttemptThreshold, hasChanges, locale, theme, updateSettings]);

  if (!hydrated) return null;

  async function handleRotate() {
    try {
      await rotatePin({ currentPin, nextPin, confirmPin });
      setCurrentPin("");
      setNextPin("");
      setConfirmPin("");
    } catch {}
  }

  const themeOptions = [
    { value: "light" as const, label: "Claro", icon: SunMedium },
    { value: "dark" as const, label: "Oscuro", icon: MoonStar },
    { value: "system" as const, label: "Sistema", icon: MonitorCog },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Ajustes" title="Preferencias y seguridad" description="Configuración compacta y funcional." />

      <Section title="Controles de seguridad" sectionKey="controls" open={sections.controls} onToggle={toggleSection}>
        <SecurityControlsList items={securityControls.slice(0, 6)} />
      </Section>

      <Section title="Preferencias" sectionKey="preferences" open={sections.preferences} onToggle={toggleSection}>
        <div className="grid gap-3 rounded-2xl bg-[var(--surface)] p-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-xl bg-[var(--field)] px-4 py-3 text-base text-[var(--text-soft)]">
            <Globe2 aria-hidden="true" className="h-5 w-5" />
            <select className="h-full w-full bg-transparent outline-none" value={locale} onChange={(event) => setLocale(event.target.value)}>
              <option value="es-PE">Español</option>
              <option value="en-US">English</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-2 rounded-xl bg-[var(--field)] p-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const active = theme === option.value;
              return (
                <button key={option.value} type="button" aria-pressed={active} className={["inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl px-4 text-base transition", active ? "bg-[var(--surface-2)] text-[var(--text)]" : "text-[var(--text-soft)] hover:bg-[var(--surface)] hover:text-[var(--text)]"].join(" ")} onClick={() => setTheme(option.value)}>
                  <Icon aria-hidden="true" className="h-5 w-5" />
                  {option.label}
                </button>
              );
            })}
          </div>
          <Input id="settings-auto-lock" label="Auto bloqueo" type="number" min="1" max="120" value={autoLockMinutes} onChange={(event) => setAutoLockMinutes(event.target.value)} />
          <Input id="settings-threshold" label="Intentos" type="number" min="3" max="15" value={failedAttemptThreshold} onChange={(event) => setFailedAttemptThreshold(event.target.value)} />
        </div>
      </Section>

      <Section title="Métodos / credencial" sectionKey="methods" open={sections.methods} onToggle={toggleSection}>
        <div className="grid gap-3 rounded-2xl bg-[var(--surface)] p-3 md:grid-cols-2">
          <ActionButton onClick={() => navigate("/settings/unlock-methods")}>Abrir métodos</ActionButton>
          <StatusChip label={`${protectionOptions.filter((item) => item.enabled).length} activos`} tone="green" leading="check" />
          <Input id="settings-current-pin" label="PIN actual" type="password" value={currentPin} onChange={(event) => setCurrentPin(event.target.value)} />
          <Input id="settings-next-pin" label="Nuevo PIN" type="password" value={nextPin} onChange={(event) => setNextPin(event.target.value)} />
          <Input id="settings-confirm-pin" label="Confirmación" type="password" value={confirmPin} onChange={(event) => setConfirmPin(event.target.value)} />
          <div className="flex gap-2">
            <ActionButton onClick={() => void handleRotate()} disabled={busy || !currentPin || !nextPin || !confirmPin}>Rotar</ActionButton>
            <ActionButton emphasis="danger" icon={ShieldAlert} onClick={() => void emergencyLock("Bloqueo de emergencia desde ajustes.")}>Emergencia</ActionButton>
          </div>
        </div>
      </Section>

      <Section title="Avanzado" sectionKey="advanced" open={sections.advanced} onToggle={toggleSection}>
        <div className="grid gap-3 rounded-2xl bg-[var(--surface)] p-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-xl bg-[var(--field)] px-4 py-3 text-base text-[var(--text-soft)]">
            <Keyboard aria-hidden="true" className="h-5 w-5" />
            <span className="min-w-[90px] text-[var(--text)]">Atajo</span>
            <input className="w-full bg-transparent outline-none" value={shortcut} onChange={(event) => setShortcut(event.target.value)} />
          </label>
          <button type="button" className={["flex cursor-pointer items-center justify-between rounded-xl bg-[var(--field)] px-4 py-3 text-base", cameraModuleEnabled ? "text-[var(--text)]" : "text-[var(--text-soft)]"].join(" ")} onClick={() => setCameraModuleEnabled((value) => !value)}>
            <span>Módulo de cámara</span>
            <StatusChip label={cameraModuleEnabled ? "Activo" : "Off"} tone={cameraModuleEnabled ? "green" : "neutral"} leading="dot" />
          </button>
          <button type="button" className={["flex cursor-pointer items-center justify-between rounded-xl bg-[var(--field)] px-4 py-3 text-base", emergencyMode ? "text-[var(--text)]" : "text-[var(--text-soft)]"].join(" ")} onClick={() => setEmergencyMode((value) => !value)}>
            <span>Modo emergencia</span>
            <StatusChip label={emergencyMode ? "Activo" : "Off"} tone={emergencyMode ? "yellow" : "neutral"} leading="dot" />
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, sectionKey, open, onToggle, children }: { title: string; sectionKey: string; open: boolean; onToggle: (key: string) => void; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-transparent">
      <button type="button" className="flex w-full cursor-pointer items-center justify-between rounded-xl px-1 py-3 text-left" onClick={() => onToggle(sectionKey)}>
        <span className="text-2xl font-semibold tracking-tight text-[var(--text)]">{title}</span>
        <ChevronDown aria-hidden="true" className={["h-5 w-5 text-[var(--text-muted)] transition", open ? "rotate-180" : ""].join(" ")} />
      </button>
      {open ? <div className="pt-2">{children}</div> : null}
    </section>
  );
}
