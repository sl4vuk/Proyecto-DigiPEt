import { motion } from "framer-motion";
import {
  Activity,
  Camera,
  FolderLock,
  LayoutDashboard,
  Settings,
  ShieldCheck
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { useSecurityStore } from "@/store/security-store";

const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/protected-items", label: "Activos protegidos", icon: FolderLock },
  { to: "/incidents", label: "Incidentes", icon: Activity },
  { to: "/camera", label: "Cámara", icon: Camera },
  { to: "/settings", label: "Ajustes", icon: Settings }
];

export function Sidebar() {
  const hydrated = useSecurityStore((state) => state.hydrated);
  const alertCount = hydrated?.overview.alertCount ?? 0;
  const risk = hydrated?.overview.riskLabel ?? "low";

  return (
    <aside className="hidden w-[300px] shrink-0 xl:block">
      <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">
              Aegis Vault
            </p>
            <h1 className="text-xl font-semibold tracking-tight">Desktop Security Suite</h1>
          </div>
        </div>

        <div className="mb-6 border border-[var(--border)] bg-[var(--panel-strong)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--text-soft)]">Postura de riesgo</p>
            <Badge variant={risk}>{hydrated?.overview.riskLabel ?? "low"}</Badge>
          </div>
          <p className="text-3xl font-semibold tracking-tight">{hydrated?.overview.riskScore ?? 0}%</p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
            Alertas activas: <span className="font-medium text-[var(--text)]">{alertCount}</span>
          </p>
        </div>

        <nav className="space-y-2">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center gap-3 border border-transparent px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]"
                      : "text-[var(--text-soft)] hover:border-[var(--border)] hover:bg-[var(--panel-strong)] hover:text-[var(--text)]"
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <motion.span
                      layout
                      initial={false}
                      animate={{ scale: isActive ? 1 : 0.94 }}
                      transition={{ type: "spring", stiffness: 380, damping: 26, delay: index * 0.015 }}
                      className="grid h-9 w-9 place-items-center border border-current bg-transparent"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </motion.span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto border border-[var(--border)] bg-[var(--panel-strong)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">
            Controles activos
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-soft)]">
            <li>- Contenedor cifrado con clave derivada por Argon2id</li>
            <li>- Integridad local con huellas y auditoría estructurada</li>
            <li>- Bloqueo automático y registros de intentos fallidos</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
