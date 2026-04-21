import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from "lucide-react";
import { useUiStore } from "@/store/ui-store";
import { Badge } from "@/components/ui/Badge";

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: ShieldAlert
};

export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), toast.durationMs ?? 4200)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [removeToast, toasts]);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-md flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant ?? "info"];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="pointer-events-auto overflow-hidden border border-[var(--border)] bg-[var(--panel)] p-4"
            >
              <div className="flex gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold tracking-tight">{toast.title}</p>
                    <button
                      className="p-1 text-[var(--text-soft)] transition hover:bg-[var(--panel-strong)] hover:text-[var(--text)]"
                      onClick={() => removeToast(toast.id)}
                      aria-label="Cerrar notificación"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {toast.description ? (
                    <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
                      {toast.description}
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <Badge variant={toast.variant ?? "info"}>{toast.variant ?? "info"}</Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
