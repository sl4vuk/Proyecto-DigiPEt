import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";
import type { ThemeMode } from "@/types/security";

export function SettingsPage() {
  const hydrated = useSecurityStore((state) => state.hydrated);
  const busy = useSecurityStore((state) => state.busy);
  const updateSettings = useSecurityStore((state) => state.updateSettings);
  const rotatePin = useSecurityStore((state) => state.rotatePin);
  const emergencyLock = useSecurityStore((state) => state.emergencyLock);
  const pushToast = useUiStore((state) => state.pushToast);

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

  if (!hydrated) return null;

  async function handleEmergency() {
    try {
      await emergencyLock("Bloqueo de emergencia activado desde ajustes.");
    } catch (error) {
      pushToast({
        title: "No se pudo activar el bloqueo de emergencia",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    }
  }

  async function handleSave() {
    try {
      await updateSettings({
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
      });
    } catch (error) {
      pushToast({
        title: "No se pudieron guardar las políticas",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    }
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
    } catch (error) {
      pushToast({
        title: "No se pudo rotar el PIN",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="settings"
        title="Políticas, tema y preferencias"
        description="Ajustes persistentes con enfoque enterprise, listos para endurecimiento adicional."
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
            <Button
              icon={SlidersHorizontal}
              onClick={() => void handleSave()}
              disabled={busy || !hasChanges}
            >
              Guardar políticas
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
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Tema</span>
              <select
                className="h-12 border border-[var(--border)] bg-[var(--field)] px-4 text-sm outline-none"
                value={theme}
                onChange={(event) => setTheme(event.target.value as ThemeMode)}
              >
                <option value="dark">Oscuro</option>
                <option value="light">Claro</option>
                <option value="system">Sistema</option>
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Auto bloqueo (min)"
                type="number"
                min="1"
                max="120"
                value={autoLockMinutes}
                onChange={(event) => setAutoLockMinutes(event.target.value)}
              />
              <Input
                label="Umbral de intentos"
                type="number"
                min="3"
                max="15"
                value={failedAttemptThreshold}
                onChange={(event) => setFailedAttemptThreshold(event.target.value)}
              />
            </div>

            <Input
              label="Idioma"
              value={locale}
              onChange={(event) => setLocale(event.target.value)}
              hint="Preparado para i18n futura."
            />

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Rutas por defecto</span>
              <textarea
                className="min-h-[150px] border border-[var(--border)] bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-[var(--text)] focus:ring-1 focus:ring-[var(--text)]"
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
                label="PIN actual"
                type="password"
                value={currentPin}
                onChange={(event) => setCurrentPin(event.target.value)}
              />
              <Input
                label="Nuevo PIN"
                type="password"
                value={nextPin}
                onChange={(event) => setNextPin(event.target.value)}
              />
              <Input
                label="Confirmación"
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
  return (
    <div className="flex items-center justify-between gap-4 border border-[var(--border)] bg-[var(--field)] px-4 py-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-7 w-12 items-center border border-[var(--border)] transition",
          checked ? "bg-[var(--text)]" : "bg-[var(--panel-strong)]"
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 bg-[var(--bg)] transition",
            checked ? "translate-x-6" : "translate-x-1"
          ].join(" ")}
        />
      </button>
    </div>
  );
}
