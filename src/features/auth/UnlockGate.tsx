import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  ShieldEllipsis,
  type LucideIcon
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSecurityStore } from "@/store/security-store";
import { formatDateTime } from "@/lib/format";

export function UnlockGate() {
  const bootstrap = useSecurityStore((state) => state.bootstrap);
  const busy = useSecurityStore((state) => state.busy);
  const lastError = useSecurityStore((state) => state.lastError);
  const setupPin = useSecurityStore((state) => state.setupPin);
  const unlock = useSecurityStore((state) => state.unlock);

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const lockoutActive = useMemo(() => {
    if (!bootstrap?.lockedUntil) return false;
    return new Date(bootstrap.lockedUntil).getTime() > Date.now();
  }, [bootstrap?.lockedUntil]);

  if (!bootstrap) return null;

  const isSetup = !bootstrap.initialized;

  async function handleSubmit() {
    try {
      if (isSetup) {
        await setupPin({ pin, confirmPin });
        return;
      }

      await unlock(pin, "pin");
    } catch {
      // El store ya refleja el error y actualiza la UI.
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[var(--bg)] text-[var(--text)] lg:grid-cols-[1.15fr_0.85fr]">
      <div className="border-b border-[var(--border)] p-8 lg:border-b-0 lg:border-r lg:p-12">
        <div className="relative max-w-xl">
          <div className="inline-flex items-center gap-3 border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--text-soft)]">
            <ShieldCheck className="h-4 w-4 text-[var(--text)]" />
            Núcleo local con cifrado fuerte y sesión efímera
          </div>

          <h1 className="mt-8 text-[clamp(2.4rem,6vw,4.6rem)] font-semibold leading-[1.02] tracking-tight">
            DigiPET protege archivos, monitorea eventos y mantiene la sesión segura.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text-soft)]">
            DigiPET organiza la protección local, la auditoría y la integridad en una arquitectura
            moderna, modular y lista para crecer. El módulo de cámara permanece desacoplado y
            preparado para evolucionar hacia detección visual, biometría o gestos.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <FeatureCard
              icon={LockKeyhole}
              title="Contenedor cifrado"
              description="Datos sensibles persistidos localmente con clave derivada desde credencial maestra."
            />
            <FeatureCard
              icon={Fingerprint}
              title="Sesión segura"
              description="PIN local, bloqueo por inactividad, contador de intentos y modo de emergencia."
            />
            <FeatureCard
              icon={ShieldEllipsis}
              title="Auditoría trazable"
              description="Incidentes, escaneos de integridad y acciones administrativas con logs exportables."
            />
            <FeatureCard
              icon={Camera}
              title="Cámara modular"
              description="Pipeline listo para MediaPipe o motor biométrico real, con fallback elegante."
            />
          </div>
        </div>
      </div>

      <div className="grid place-items-center p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full max-w-md border border-[var(--border)] bg-[var(--panel)] p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">
                {isSetup ? "Onboarding seguro" : "Acceso protegido"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {isSetup ? "Crear PIN maestro" : "Desbloquear sesión"}
              </h2>
            </div>
            <Badge variant={bootstrap.sessionLocked ? "sealed" : "unlocked"}>
              {bootstrap.sessionLocked ? "sellado" : "activo"}
            </Badge>
          </div>

          {bootstrap.lockReason ? (
            <div className="mb-4 border border-[var(--border)] bg-[var(--panel-strong)] p-4">
              <p className="text-sm font-medium">Último motivo de bloqueo</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{bootstrap.lockReason}</p>
            </div>
          ) : null}

          {lastError ? (
            <div className="mb-4 border border-[var(--border)] bg-[var(--danger-bg)] p-4 text-sm leading-6 text-[var(--text)]">
              {lastError}
            </div>
          ) : null}

          <div className="grid gap-4">
            <Input
              label={isSetup ? "PIN maestro" : "PIN"}
              placeholder="Ingresa tu credencial local"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              hint={isSetup ? "Usa un PIN robusto de al menos 6 dígitos o caracteres." : undefined}
            />

            {isSetup ? (
              <Input
                label="Confirmar PIN"
                placeholder="Repite el PIN maestro"
                type="password"
                value={confirmPin}
                onChange={(event) => setConfirmPin(event.target.value)}
              />
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 text-sm text-[var(--text-soft)]">
            <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3">
              <span>Intentos fallidos</span>
              <span className="font-medium text-[var(--text)]">
                {bootstrap.failedAttempts} / {bootstrap.failedAttemptThreshold}
              </span>
            </div>
            <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3">
              <span>Bloqueo temporal</span>
              <span className="font-medium text-[var(--text)]">
                {bootstrap.lockedUntil ? formatDateTime(bootstrap.lockedUntil) : "No activo"}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Button
              fluid
              onClick={() => void handleSubmit()}
              disabled={busy || !pin || (isSetup && !confirmPin) || lockoutActive}
              icon={isSetup ? ShieldCheck : LockKeyhole}
            >
              {busy ? "Procesando..." : isSetup ? "Inicializar contenedor" : "Desbloquear"}
            </Button>

            <Button variant="ghost" fluid disabled icon={Camera}>
              Módulo biométrico preparado
            </Button>
          </div>

          <p className="mt-5 text-center text-xs leading-6 text-[var(--text-soft)]">
            No se transmite telemetría externa. Todo el flujo sensible reside en el backend de
            Tauri y almacenamiento local cifrado.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="grid h-11 w-11 place-items-center border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
    </div>
  );
}
