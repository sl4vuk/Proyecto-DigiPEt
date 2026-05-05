import { Bell, ChevronDown, LockKeyhole, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButton } from "@/components/security/ActionButton";
import { StatusChip } from "@/components/security/StatusChip";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";

export function TopBar() {
  const events = useSecurityStore((state) => state.hydrated?.events ?? []);
  const lock = useSecurityStore((state) => state.lock);
  const rescanIntegrity = useSecurityStore((state) => state.rescanIntegrity);
  const pushToast = useUiStore((state) => state.pushToast);
  const shortcut = useUiStore((state) => state.commandPaletteShortcut);
  const [query, setQuery] = useState("");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [secureOpen, setSecureOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const alertsRef = useRef<HTMLDivElement | null>(null);
  const secureRef = useRef<HTMLDivElement | null>(null);

  const alerts = useMemo(() => events.slice(0, 4), [events]);
  const unreadCritical = events.filter((event) => event.severity === "critical").length;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditable = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      const normalizedShortcut = shortcut.toLowerCase();
      const isCmdK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (normalizedShortcut === "ctrl+k" && isCmdK) {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (event.key === "Escape") {
        setAlertsOpen(false);
        setSecureOpen(false);
      }
      if (isEditable) return;
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (alertsRef.current && !alertsRef.current.contains(target)) setAlertsOpen(false);
      if (secureRef.current && !secureRef.current.contains(target)) setSecureOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [shortcut]);

  async function handleSecureAction(action: "status" | "rescan" | "lock") {
    setSecureOpen(false);
    if (action === "status") {
      pushToast({ title: "Estado seguro", description: "La sesión y la integridad se muestran en el dashboard.", variant: "info" });
      return;
    }
    if (action === "rescan") {
      try {
        await rescanIntegrity();
      } catch (error) {
        pushToast({ title: "No se pudo revalidar", description: error instanceof Error ? error.message : String(error), variant: "critical" });
      }
      return;
    }
    await lock("Bloqueo manual desde la barra superior.");
  }

  return (
    <header className="flex flex-col gap-3 px-1 py-1 lg:flex-row lg:items-center lg:justify-between">
      <label className="flex h-12 min-w-[280px] items-center gap-3 rounded-xl bg-[var(--field)] px-4 text-base text-[var(--text-soft)]">
        <Search aria-hidden="true" className="h-5 w-5" />
        <input
          ref={searchRef}
          aria-label="Buscar en DigiPET"
          className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
          placeholder="Buscar en DigiPET"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="rounded-lg bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text-muted)]">{shortcut}</span>
      </label>

      <div className="flex items-center gap-2">
        <div ref={alertsRef} className="relative">
          <button
            type="button"
            aria-label="Abrir alertas"
            aria-expanded={alertsOpen}
            aria-haspopup="menu"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--field)] px-4 py-3 text-base text-[var(--text)] transition hover:bg-[var(--field-hover)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            onClick={() => setAlertsOpen((value) => !value)}
          >
            <Bell aria-hidden="true" className="h-5 w-5" />
            <span>Alertas</span>
            {unreadCritical > 0 ? <span className="inline-flex size-2 rounded-full bg-[var(--danger)]" /> : null}
          </button>
          {alertsOpen ? (
            <div role="menu" className="absolute right-0 z-20 mt-2 w-[320px] rounded-2xl bg-[var(--surface-2)] p-2">
              {alerts.length ? alerts.map((event) => (
                <button key={event.id} type="button" className="flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-[var(--surface)]">
                  <span className="mt-1 inline-flex size-2 rounded-full bg-[var(--danger)]" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[var(--text)]">{event.title}</span>
                    <span className="block text-xs text-[var(--text-soft)]">{event.description}</span>
                  </span>
                </button>
              )) : <p className="px-3 py-3 text-sm text-[var(--text-soft)]">Sin alertas recientes.</p>}
            </div>
          ) : null}
        </div>

        <div ref={secureRef} className="relative">
          <button
            type="button"
            aria-label="Abrir estado seguro"
            aria-expanded={secureOpen}
            aria-haspopup="menu"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--field)] px-4 py-3 text-base text-[var(--text)] transition hover:bg-[var(--field-hover)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            onClick={() => setSecureOpen((value) => !value)}
          >
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[var(--ok)]" />
            <span>Seguro</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 text-[var(--text-muted)]" />
          </button>
          {secureOpen ? (
            <div role="menu" className="absolute right-0 z-20 mt-2 w-[220px] rounded-2xl bg-[var(--surface-2)] p-2">
              <MenuButton label="Ver estado" onClick={() => void handleSecureAction("status")} />
              <MenuButton label="Revalidar integridad" onClick={() => void handleSecureAction("rescan")} />
              <MenuButton label="Bloquear" onClick={() => void handleSecureAction("lock")} />
            </div>
          ) : null}
        </div>

        <ActionButton emphasis="danger" icon={LockKeyhole} onClick={() => void lock("Bloqueo manual desde la barra superior.")}>Bloquear</ActionButton>
      </div>
    </header>
  );
}

function MenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="flex w-full cursor-pointer items-center rounded-xl px-3 py-3 text-left text-sm text-[var(--text)] hover:bg-[var(--surface)]" onClick={onClick}>
      {label}
    </button>
  );
}
