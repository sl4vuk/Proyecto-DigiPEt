import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { UnlockGate } from "@/features/auth/UnlockGate";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Toaster } from "@/components/ui/Toaster";
import { useAppBootstrap } from "@/hooks/useAppBootstrap";
import { useInactivityLock } from "@/hooks/useInactivityLock";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";

export default function App() {
  useAppBootstrap();

  const bootstrap = useSecurityStore((state) => state.bootstrap);
  const bootstrapping = useSecurityStore((state) => state.bootstrapping);
  const lastError = useSecurityStore((state) => state.lastError);
  const loadBootstrap = useSecurityStore((state) => state.loadBootstrap);
  const lock = useSecurityStore((state) => state.lock);
  const hydrated = useSecurityStore((state) => state.hydrated);
  const theme = useUiStore((state) => state.theme);
  const applyTheme = useUiStore((state) => state.applyTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

  useInactivityLock({
    enabled: Boolean(hydrated),
    minutes: hydrated?.settings.autoLockMinutes ?? 10,
    onLock: async () => {
      await lock("Sesión bloqueada por inactividad.");
    }
  });

  if (bootstrapping || !bootstrap) {
    if (!bootstrapping && !bootstrap) {
      return (
        <>
          <div className="grid min-h-screen place-items-center bg-[var(--bg)] px-6 text-[var(--text)]">
            <div className="w-full max-w-xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
                Inicio del entorno
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                No se pudo iniciar la interfaz segura
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
                {lastError ?? "El backend local no respondió como se esperaba."}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button onClick={() => void loadBootstrap()}>Reintentar</Button>
              </div>
            </div>
          </div>
          <Toaster />
        </>
      );
    }

    return (
      <>
        <Loader
          title="Inicializando núcleo seguro"
          description="Cargando estado local del contenedor cifrado y políticas de sesión."
          fullScreen
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {bootstrap.sessionLocked ? <UnlockGate /> : <RouterProvider router={router} />}
      <Toaster />
    </>
  );
}
