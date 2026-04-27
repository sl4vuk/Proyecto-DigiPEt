import { motion } from "framer-motion";
import {
  Activity,
  Camera,
  FolderLock,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TerminalSquare,
  ShieldCheck
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/i18n";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";

const navigation = [
  { to: "/", key: "dashboard", icon: LayoutDashboard, end: true },
  { to: "/protected-items", key: "protectedItems", icon: FolderLock },
  { to: "/incidents", key: "incidents", icon: Activity },
  { to: "/camera", key: "camera", icon: Camera },
  { to: "/terminal", key: "terminal", icon: TerminalSquare },
  { to: "/settings", key: "settings", icon: Settings }
];

export function Sidebar() {
  const t = useI18n();
  const hydrated = useSecurityStore((state) => state.hydrated);
  const alertCount = hydrated?.overview.alertCount ?? 0;
  const risk = hydrated?.overview.riskLabel ?? "low";
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside className={collapsed ? "shrink-0 xl:w-[92px]" : "shrink-0 xl:w-[276px]"}>
      <div className="flex flex-col gap-3 border-r border-[var(--border)] bg-[var(--panel)] p-2 xl:sticky xl:left-0 xl:top-0 xl:h-dvh xl:rounded-none xl:border-l-0 xl:border-t-0 xl:border-b-0 xl:shadow-none">
        <div className={collapsed ? "hidden xl:flex xl:justify-center xl:pt-2" : "hidden items-center gap-4 px-2 pt-2 xl:flex"}>
          <div className="grid size-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)] shadow-[var(--shadow-soft)]">
            <ShieldCheck aria-hidden="true" className="h-7 w-7" />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)]">DigiPET</p>
              <div className="text-xl font-semibold tracking-tight">Secure Desktop Companion</div>
            </div>
          ) : null}
        </div>

        <div className={collapsed ? "hidden" : "hidden rounded-3xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 xl:block"}>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--text-soft)]">Postura de riesgo</p>
            <Badge variant={risk}>{hydrated?.overview.riskLabel ?? "low"}</Badge>
          </div>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">{hydrated?.overview.riskScore ?? 0}%</p>
          <p className="mt-2 text-pretty text-sm leading-6 text-[var(--text-soft)]">
            Alertas activas: <span className="font-medium text-[var(--text)]">{alertCount}</span>
          </p>
        </div>

        <div className="hidden xl:flex xl:justify-end">
          <button
            type="button"
            aria-label={collapsed ? t.topbar.expandSidebar : t.topbar.collapseSidebar}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text-soft)] transition hover:text-[var(--text)]"
            onClick={() => toggleSidebar()}
          >
            <CollapseIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 xl:flex-1 xl:flex-col xl:overflow-visible" aria-label="Navegación principal">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const label = t.nav[item.key as keyof typeof t.nav];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "group relative flex min-w-max items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition duration-150 ease-out xl:min-w-0",
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)] shadow-[var(--shadow-soft)]"
                      : "border-transparent text-[var(--text-soft)] hover:border-[var(--border)] hover:bg-[var(--panel-strong)] hover:text-[var(--text)]"
                  ].join(" ")
                }
                title={collapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <motion.span
                      layout
                      initial={false}
                      animate={{ scale: isActive ? 1 : 0.97 }}
                      transition={{ type: "spring", stiffness: 360, damping: 28, delay: index * 0.01 }}
                      className="grid size-9 place-items-center rounded-xl border border-current/20 bg-[var(--panel)]"
                    >
                      <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                    </motion.span>
                    {!collapsed ? <span>{label}</span> : null}
                    {item.key === "incidents" && alertCount > 0 && !collapsed ? (
                      <Badge variant="critical" className="ml-auto">{alertCount}</Badge>
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
