import { useMemo, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { ActionButton } from "@/components/security/ActionButton";
import { MethodCard } from "@/components/security/MethodCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { unlockMethods } from "@/features/security/mock-data";
import { useSecurityStore } from "@/store/security-store";

export function UnlockGate() {
  const bootstrap = useSecurityStore((state) => state.bootstrap);
  const busy = useSecurityStore((state) => state.busy);
  const lastError = useSecurityStore((state) => state.lastError);
  const setupPin = useSecurityStore((state) => state.setupPin);
  const unlock = useSecurityStore((state) => state.unlock);

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(unlockMethods[0]?.id ?? "password");

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
      // error handled in store
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-dvh max-w-[1680px] flex-col gap-8 px-6 py-8 xl:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr] xl:items-start">
          <div className="max-w-[860px]">
            <div className="inline-flex items-center gap-3 rounded-full bg-[var(--panel)] px-4 py-2 text-sm text-[var(--text-soft)] shadow-[var(--shadow-soft)]">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-[var(--accent-strong)]" />
              Núcleo local con cifrado fuerte y sesión efímera
            </div>

            <h1 className="mt-8 text-balance text-[clamp(4.5rem,14vw,8rem)] font-semibold leading-none tracking-tight">
              DigiPET
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-xl leading-9 text-[var(--text-soft)]">
              protege archivos, monitorea eventos y mantiene la sesión segura.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {unlockMethods.map((method) => (
                <MethodCard
                  key={method.id}
                  method={method}
                  selected={selectedMethod === method.id}
                  onClick={() => setSelectedMethod(method.id)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[34px] bg-[var(--panel)] p-6 shadow-[var(--shadow)]">
            <Input
              id="unlock-pin"
              label={undefined}
              placeholder="Ingresa tu contraseña o passphrase local"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
            />

            {isSetup ? (
              <div className="mt-4">
                <Input
                  id="unlock-confirm-pin"
                  label={undefined}
                  placeholder="Confirma la credencial"
                  type="password"
                  value={confirmPin}
                  onChange={(event) => setConfirmPin(event.target.value)}
                />
              </div>
            ) : null}

            {lastError ? (
              <div className="mt-4 rounded-2xl bg-[var(--panel-strong)] px-4 py-3 text-sm leading-6 text-[var(--text)]" role="alert">
                {lastError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => void handleSubmit()}
                disabled={busy || !pin || (isSetup && !confirmPin) || lockoutActive}
                icon={LockKeyhole}
              >
                {busy ? "Procesando..." : isSetup ? "Inicializar contenedor" : "Desbloquear"}
              </Button>
              <ActionButton emphasis="subtle">{unlockMethods.find((item) => item.id === selectedMethod)?.title ?? "Método"}</ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
