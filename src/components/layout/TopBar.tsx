import { motion } from "framer-motion";
import { Bell, LockKeyhole, Search, ShieldAlert } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";

const titles: Record<string, string> = {
  "/": "Centro de operaciones",
  "/protected-items": "Gestión de activos protegidos",
  "/incidents": "Historial y respuesta",
  "/camera": "Módulo de cámara y gestos",
  "/settings": "Configuración profesional"
};

export function TopBar() {
  const location = useLocation();
  const hydrated = useSecurityStore((state) => state.hydrated);
  const lock = useSecurityStore((state) => state.lock);
  const pushToast = useUiStore((state) => state.pushToast);

  const unreadCritical = hydrated?.events.filter((event) => event.severity === "critical").length ?? 0;
  const title = titles[location.pathname] ?? "Aegis Vault";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-soft)]">
          Plataforma de seguridad
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[260px] items-center gap-3 border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--text-soft)]">
          <Search className="h-4 w-4" />
          <span>Operación local, sin telemetría remota</span>
        </div>

        <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            icon={Bell}
            onClick={() =>
              pushToast({
                title: "Centro de notificaciones",
                description: "Revisa la vista de incidentes para el detalle completo de eventos.",
                variant: "info"
              })
            }
          >
            Notificaciones
            {unreadCritical > 0 ? <Badge variant="critical">{unreadCritical}</Badge> : null}
          </Button>
        </motion.div>

        <ThemeToggle />

        <Button
          variant="secondary"
          icon={ShieldAlert}
          onClick={() =>
            pushToast({
              title: "Último escaneo",
              description: hydrated?.overview.lastScanAt
                ? `Escaneo local registrado en ${new Date(hydrated.overview.lastScanAt).toLocaleString("es-PE")}.`
                : "Todavía no existe un escaneo de integridad registrado.",
              variant: "info"
            })
          }
        >
          Estado
        </Button>

        <Button
          variant="danger"
          icon={LockKeyhole}
          onClick={() => void lock("Bloqueo manual desde la barra superior.")}
        >
          Bloquear
        </Button>
      </div>
    </div>
  );
}
