import { motion } from "framer-motion";
import {
  Activity,
  Camera,
  ChevronLeft,
  FolderLock,
  LayoutDashboard,
  MonitorSmartphone,
  Settings,
  ShieldCheck,
  TerminalSquare,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUiStore } from "@/store/ui-store";

const navigation: Array<{
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}> = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/protected-items", label: "Activos", icon: FolderLock },
  { to: "/incidents", label: "Incidentes", icon: Activity, badge: 1 },
  { to: "/camera", label: "Cámara", icon: Camera },
  { to: "/terminal", label: "Terminal", icon: TerminalSquare },
  { to: "/sessions", label: "Sesiones", icon: MonitorSmartphone },
  { to: "/settings", label: "Ajustes", icon: Settings },
];

export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside className={collapsed ? "shrink-0 xl:w-[84px]" : "shrink-0 xl:w-[240px]"}>
      <div className="flex h-screen flex-col overflow-hidden bg-[var(--surface)] px-2 py-3">
        <div className={collapsed ? "mb-6 flex justify-center" : "mb-7 flex items-start gap-3 px-2"}>
          <div className="grid size-12 place-items-center rounded-xl bg-[var(--field)] text-[var(--text)]">
            <ShieldCheck aria-hidden="true" className="h-7 w-7" />
          </div>
          {!collapsed ? (
            <div className="pt-1">
              <p className="text-2xl font-semibold leading-none tracking-tight text-[var(--text)]">DigiPET</p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">Secure Desktop<br />Companion</p>
            </div>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-1.5" aria-label="Navegación principal">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    "group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition duration-150 ease-out",
                    collapsed ? "justify-center px-0" : "",
                    isActive
                      ? "bg-[var(--field)] text-[var(--text)]"
                      : "text-[var(--text-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <motion.span
                      layout
                      initial={false}
                      animate={{ scale: isActive ? 1 : 0.98 }}
                      transition={{ type: "spring", stiffness: 320, damping: 28, delay: index * 0.01 }}
                      className={[
                        "grid size-10 shrink-0 place-items-center rounded-xl",
                        isActive ? "text-[var(--text)]" : "text-[var(--text-soft)]",
                      ].join(" ")}
                    >
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </motion.span>
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    {!collapsed && item.badge ? (
                      <span className="ml-auto inline-flex size-2 rounded-full bg-[var(--danger)]" aria-label={`${item.badge} alertas`} />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-4 px-1">
          {!collapsed ? <p className="mb-2 px-2 text-xs text-[var(--text-muted)]">Administrador</p> : null}
          <button
            type="button"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            title={collapsed ? "Expandir" : "Colapsar"}
            className={[
              "inline-flex w-full cursor-pointer items-center rounded-xl px-3 py-3 text-base text-[var(--text-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              collapsed ? "justify-center px-0" : "gap-3",
            ].join(" ")}
            onClick={() => toggleSidebar()}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--field)]">
              <ChevronLeft aria-hidden="true" className={["h-5 w-5 transition", collapsed ? "rotate-180" : ""].join(" ")} />
            </span>
            {!collapsed ? <span>Colapsar</span> : null}
          </button>
        </div>
      </div>
    </aside>
  );
}
