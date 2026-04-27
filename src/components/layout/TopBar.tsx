import { motion } from "framer-motion";
import { Bell, LockKeyhole, PanelLeftClose, PanelLeftOpen, Search, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";

export function TopBar() {
  const t = useI18n();
  const location = useLocation();
  const hydrated = useSecurityStore((state) => state.hydrated);
  const lock = useSecurityStore((state) => state.lock);
  const pushToast = useUiStore((state) => state.pushToast);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const [searchOpen, setSearchOpen] = useState(false);

  const unreadCritical = hydrated?.events.filter((event) => event.severity === "critical").length ?? 0;
  const titleMap: Record<string, string> = {
    "/": t.pages.dashboardTitle,
    "/protected-items": t.pages.protectedTitle,
    "/incidents": t.pages.incidentsTitle,
    "/camera": t.pages.cameraTitle,
    "/terminal": t.pages.terminalTitle,
    "/settings": t.pages.settingsTitle
  };
  const title = titleMap[location.pathname] ?? "DigiPET";
  const SidebarIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--panel)] px-4 py-4 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center lg:justify-between lg:px-5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={collapsed ? t.topbar.expandSidebar : t.topbar.collapseSidebar}
          className="mt-1 hidden size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text-soft)] transition hover:text-[var(--text)] xl:inline-flex"
          onClick={() => toggleSidebar()}
        >
          <SidebarIcon aria-hidden="true" className="h-4 w-4" />
        </button>

        <div>
        <p className="text-xs font-medium text-[var(--text-muted)]">
          {t.topbar.shell}
        </p>
        <h2 className="mt-1 text-balance text-2xl font-semibold tracking-tight">{title}</h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {searchOpen ? (
          <div className="flex min-w-[280px] items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-3 py-1.5 shadow-[var(--shadow-soft)]">
            <Search aria-hidden="true" className="h-4 w-4 text-[var(--text-soft)]" />
            <input
              autoFocus
              aria-label={t.topbar.searchPlaceholder}
              className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
              placeholder={t.topbar.searchPlaceholder}
            />
            <button
              type="button"
              aria-label={t.topbar.closeSearch}
              className="inline-flex size-8 items-center justify-center rounded-lg text-[var(--text-soft)] transition hover:bg-[var(--panel)] hover:text-[var(--text)]"
              onClick={() => setSearchOpen(false)}
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-label={t.topbar.openSearch}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text-soft)] transition hover:text-[var(--text)]"
            onClick={() => setSearchOpen(true)}
            title={t.topbar.localOnly}
          >
            <Search aria-hidden="true" className="h-4 w-4" />
          </button>
        )}

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
            {t.topbar.notifications}
            {unreadCritical > 0 ? <Badge variant="critical">{unreadCritical}</Badge> : null}
          </Button>
        </motion.div>

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
          {t.topbar.status}
        </Button>

        <Button
          variant="danger"
          icon={LockKeyhole}
          onClick={() => void lock("Bloqueo manual desde la barra superior.")}
        >
          {t.topbar.lock}
        </Button>
      </div>
    </div>
  );
}
