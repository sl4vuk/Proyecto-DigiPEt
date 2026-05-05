import { AlertTriangle, Download, Filter, MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityList } from "@/components/security/ActivityList";
import { ActionButton } from "@/components/security/ActionButton";
import { MetricItem } from "@/components/security/MetricItem";
import { PageHeader } from "@/components/ui/PageHeader";
import { pickExportDestination } from "@/services/security-api";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";
import type { Severity } from "@/types/security";

export function IncidentsPage() {
  const hydrated = useSecurityStore((state) => state.hydrated);
  const exportEvents = useSecurityStore((state) => state.exportEvents);
  const pushToast = useUiStore((state) => state.pushToast);
  const [severity, setSeverity] = useState<"all" | Severity>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFilterOpen(false);
        setMenuOpen(false);
      }
    }

    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (filterRef.current && !filterRef.current.contains(target)) setFilterOpen(false);
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  if (!hydrated) return null;

  const filtered = useMemo(
    () => hydrated.events.filter((event) => severity === "all" || event.severity === severity),
    [hydrated.events, severity]
  );

  const criticalCount = hydrated.events.filter((event) => event.severity === "critical").length;
  const warningCount = hydrated.events.filter((event) => event.severity === "warning").length;
  const integrityCount = hydrated.events.filter((event) => event.category === "integrity").length;

  async function handleExport() {
    try {
      const destination = await pickExportDestination();
      await exportEvents(destination ?? undefined);
      setMenuOpen(false);
    } catch (error) {
      pushToast({
        title: "No se pudo exportar",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical",
      });
    }
  }

  const activityItems = filtered.slice(0, 8).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    timestamp: new Date(event.timestamp).toLocaleString("es-PE"),
    severity: event.severity,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Incidentes"
        title="Centro de incidentes"
        description="Eventos y alertas relevantes."
        actions={
          <>
            <div ref={filterRef} className="relative">
              <ActionButton emphasis="subtle" icon={Filter} onClick={() => setFilterOpen((value) => !value)}>
                Filtros
              </ActionButton>
              {filterOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-[180px] rounded-2xl bg-[var(--surface-2)] p-2">
                  {[
                    { value: "all", label: "Todas" },
                    { value: "critical", label: "Crítico" },
                    { value: "warning", label: "Warning" },
                    { value: "info", label: "Info" },
                    { value: "success", label: "Success" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      className="flex w-full cursor-pointer rounded-xl px-3 py-3 text-left text-sm text-[var(--text)] hover:bg-[var(--surface)]"
                      onClick={() => {
                        setSeverity(item.value as typeof severity);
                        setFilterOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label="Acciones"
                className="grid size-11 cursor-pointer place-items-center rounded-xl bg-[var(--field)] text-[var(--text-soft)] hover:bg-[var(--field-hover)] hover:text-[var(--text)]"
                onClick={() => setMenuOpen((value) => !value)}
              >
                <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-20 mt-2 w-[200px] rounded-2xl bg-[var(--surface-2)] p-2">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer rounded-xl px-3 py-3 text-left text-sm text-[var(--text)] hover:bg-[var(--surface)]"
                    onClick={() => void handleExport()}
                  >
                    Exportar JSON
                  </button>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer rounded-xl px-3 py-3 text-left text-sm text-[var(--text)] hover:bg-[var(--surface)]"
                    onClick={() => {
                      setSeverity("all");
                      setMenuOpen(false);
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : null}
            </div>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
        <MetricItem icon={AlertTriangle} iconTone="neutral" label="Críticos" value={criticalCount} state="Critical" stateTone="red" />
        <MetricItem icon={AlertTriangle} iconTone="neutral" label="Advertencias" value={warningCount} state="Warning" stateTone="yellow" />
        <MetricItem icon={Download} iconTone="neutral" label="Integridad" value={integrityCount} state="Activa" stateTone="green" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <section className="rounded-[28px] bg-transparent p-1">
          <ActivityList items={activityItems} />
        </section>

        <section className="rounded-[28px] bg-transparent p-1">
          <div className="rounded-2xl bg-[var(--surface)] p-4">
            <h3 className="text-xl font-semibold text-[var(--text)]">Detalle</h3>
            {filtered[0] ? (
              <div className="mt-3 space-y-2 text-sm text-[var(--text-soft)]">
                <p className="font-medium text-[var(--text)]">{filtered[0].title}</p>
                <p>{filtered[0].description}</p>
                <p>{new Date(filtered[0].timestamp).toLocaleString("es-PE")}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--text-soft)]">No hay eventos para mostrar.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
