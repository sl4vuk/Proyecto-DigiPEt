import { useEffect, useMemo, useState } from "react";
import { Globe2, MoonStar, MonitorCog, ShieldAlert, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/i18n";
import { useSecurityStore } from "@/store/security-store";
import type { ThemeMode } from "@/types/security";

export function SettingsPage() {
  const t = useI18n();
  const hydrated = useSecurityStore((state) => state.hydrated);
  const busy = useSecurityStore((state) => state.busy);
  const updateSettings = useSecurityStore((state) => state.updateSettings);
  const rotatePin = useSecurityStore((state) => state.rotatePin);
  const emergencyLock = useSecurityStore((state) => state.emergencyLock);

  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [autoLockMinutes, setAutoLockMinutes] = useState("10");
  const [failedAttemptThreshold, setFailedAttemptThreshold] = useState("5");
  const [cameraModuleEnabled, setCameraModuleEnabled] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(true);
  const [locale, setLocale] = useState("es-PE");
  const [defaultRoots, setDefaultRoots] = useState("");
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
    setDefaultRoots(hydrated.settings.defaultRoots.join("\n"));
  }, [hydrated]);

  const hasChanges = useMemo(() => {
    if (!hydrated) return false;
    return (
      theme !== hydrated.settings.theme ||
      Number(autoLockMinutes) !== hydrated.settings.autoLockMinutes ||
      Number(failedAttemptThreshold) !== hydrated.settings.failedAttemptThreshold ||
      cameraModuleEnabled !== hydrated.settings.cameraModuleEnabled ||
      emergencyMode !== hydrated.settings.emergencyMode ||
      locale !== hydrated.settings.locale ||
      defaultRoots !== hydrated.settings.defaultRoots.join("\n")
    );
  }, [
    autoLockMinutes,
    cameraModuleEnabled,
    defaultRoots,
    emergencyMode,
    failedAttemptThreshold,
    hydrated,
    locale,
    theme
  ]);

  useEffect(() => {
    if (!hasChanges) return;

    const timeout = window.setTimeout(() => {
      void updateSettings({
        theme,
        autoLockMinutes: Number(autoLockMinutes),
        failedAttemptThreshold: Number(failedAttemptThreshold),
        cameraModuleEnabled,
        emergencyMode,
        locale,
        defaultRoots: defaultRoots
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean)
      }).catch(() => undefined);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [
    autoLockMinutes,
    cameraModuleEnabled,
    defaultRoots,
    emergencyMode,
    failedAttemptThreshold,
    locale,
    theme,
    updateSettings,
    hasChanges
  ]);

  if (!hydrated) return null;

  async function handleEmergency() {
    try {
      await emergencyLock("Bloqueo de emergencia activado desde ajustes.");
    } catch {}
  }

  async function handleRotate() {
    try {
      await rotatePin({
      currentPin,
      nextPin,
      confirmPin
      });
      setCurrentPin("");
      setNextPin("");
      setConfirmPin("");
    } catch {}
  }

  const themeOptions = [
    { value: "light" as const, label: "Claro", icon: SunMedium },
    { value: "dark" as const, label: "Oscuro", icon: MoonStar },
    { value: "system" as const, label: "Sistema", icon: MonitorCog }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.pages.settingsEyebrow}
        title={t.pages.settingsTitle}
        description={t.pages.settingsDescription}
        actions={
          <>
            <Button
              variant="secondary"
              icon={ShieldAlert}
              onClick={() =>
                void handleEmergency()
              }
            >
              Bloqueo de emergencia
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card
          title="Política operativa"
          description="Tiempo de auto bloqueo, umbral de fallos y módulo visual."
        >
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t.settings.language}</span>
                <span className="flex h-12 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--field)] px-4 text-sm">
                  <Globe2 aria-hidden="true" className="h-4 w-4 text-[var(--text-soft)]" />
                  <select
                    className="h-full w-full bg-transparent outline-none"
                    value={locale}
                    onChange={(event) => setLocale(event.target.value)}
                  >
                    <option value="es-PE">Español</option>
                    <option value="en-US">English</option>
                  </select>
                </span>
                <span className="text-xs text-[var(--text-soft)]">{t.settings.localeHint}</span>
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t.settings.theme}</span>
                <div className="inline-flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-1 shadow-[var(--shadow-soft)]">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const active = theme === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        className={[
                          "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition",
                          active
                            ? "bg-[var(--accent-soft)] text-[var(--text)]"
                            : "text-[var(--text-soft)] hover:bg-[var(--panel-strong)] hover:text-[var(--text)]"
                        ].join(" ")}
                        onClick={() => setTheme(option.value)}
                      >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                  id="settings-auto-lock"
                  label={t.settings.autoLock}
                type="number"
                min="1"
                max="120"
                value={autoLockMinutes}
                onChange={(event) => setAutoLockMinutes(event.target.value)}
              />
              <Input
                  id="settings-threshold"
                  label={t.settings.threshold}
                type="number"
                min="3"
                max="15"
                value={failedAttemptThreshold}
                onChange={(event) => setFailedAttemptThreshold(event.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-4 text-sm text-[var(--text-soft)]">
              <p className="font-medium text-[var(--text)]">Traducción e i18n</p>
              <p className="mt-1 text-pretty leading-6">
                La interfaz usa una capa i18n local y queda preparada para integrar Google Translate
                desde el backend de Tauri con caché y credenciales seguras.
              </p>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t.settings.defaultRoots}</span>
              <textarea
                className="min-h-[150px] rounded-2xl border border-[var(--border)] bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--ring)]"
                value={defaultRoots}
                onChange={(event) => setDefaultRoots(event.target.value)}
                placeholder={"C:\\Usuarios\\Operaciones\\Documentos\nD:\\Vault"}
              />
            </label>

            <ToggleRow
              title="Módulo de cámara"
              description="Permite pruebas visuales, calibración y eventos de vigilancia."
              checked={cameraModuleEnabled}
              onChange={setCameraModuleEnabled}
            />

            <ToggleRow
              title="Modo de emergencia"
              description="Intensifica respuesta en eventos o múltiples intentos fallidos."
              checked={emergencyMode}
              onChange={setEmergencyMode}
            />
          </div>
        </Card>

        <div className="space-y-5">
          <Card
            title="Rotación de credencial maestra"
            description="Re-cifra la bóveda local con un nuevo PIN."
          >
            <div className="grid gap-4">
              <Input
                  id="settings-current-pin"
                label={t.settings.currentPin}
                type="password"
                value={currentPin}
                onChange={(event) => setCurrentPin(event.target.value)}
              />
              <Input
                  id="settings-next-pin"
                label={t.settings.nextPin}
                type="password"
                value={nextPin}
                onChange={(event) => setNextPin(event.target.value)}
              />
              <Input
                  id="settings-confirm-pin"
                label={t.settings.confirmPin}
                type="password"
                value={confirmPin}
                onChange={(event) => setConfirmPin(event.target.value)}
              />
              <Button
                onClick={() => void handleRotate()}
                disabled={busy || !currentPin || !nextPin || !confirmPin}
              >
                Rotar PIN
              </Button>
            </div>
          </Card>

          <Card
            title="Notas de endurecimiento"
            description="Controles ya incluidos en esta base."
          >
            <ul className="space-y-3 text-sm leading-6 text-[var(--text-soft)]">
              <li>- No hay secretos hardcodeados; salts y hashes se generan localmente.</li>
              <li>- La sesión se mantiene en memoria y se desmonta al bloquearse.</li>
              <li>- La exportación de eventos produce archivos JSON listos para auditoría.</li>
              <li>- El diseño soporta tema claro y oscuro con contraste visible.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({ title, description, checked, onChange }: ToggleRowProps) {
  const titleId = `toggle-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--field)] px-4 py-4">
      <div>
        <p id={titleId} className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={titleId}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-7 w-12 items-center rounded-full border border-[var(--border)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          checked ? "bg-[var(--text)]" : "bg-[var(--panel-strong)]"
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 rounded-full bg-[var(--bg)] transition",
            checked ? "translate-x-6" : "translate-x-1"
          ].join(" ")}
        />
      </button>
    </div>
  );
}
