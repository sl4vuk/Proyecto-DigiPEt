import { Activity, FolderLock, LockKeyhole, ShieldAlert } from "lucide-react";
import { ActivityList } from "@/components/security/ActivityList";
import { ActionButton } from "@/components/security/ActionButton";
import { DeviceSessionPanel } from "@/components/security/DeviceSessionPanel";
import { MetricItem } from "@/components/security/MetricItem";
import { PageHeader } from "@/components/ui/PageHeader";
import { buildCurrentSession, buildDashboardActivities, otherDevices, accessHistory } from "@/features/security/mock-data";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";

export function DashboardPage() {
  const hydrated = useSecurityStore((state) => state.hydrated);
  const rescanIntegrity = useSecurityStore((state) => state.rescanIntegrity);
  const pushToast = useUiStore((state) => state.pushToast);

  if (!hydrated) return null;

  const current = buildCurrentSession(hydrated.session);
  const activity = buildDashboardActivities(hydrated).slice(0, 3);

  async function handleRescan() {
    try {
      await rescanIntegrity();
    } catch (error) {
      pushToast({ title: "No se pudo revalidar", description: error instanceof Error ? error.message : String(error), variant: "critical" });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dashboard" title="Resumen de seguridad" description="Vista compacta del entorno protegido." />

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        <MetricItem icon={FolderLock} iconTone="neutral" label="Activos protegidos" value={hydrated.overview.protectedItems} state="OK" stateTone="green" />
        <MetricItem icon={ShieldAlert} iconTone="neutral" label="Incidentes activos" value={hydrated.overview.alertCount} state={hydrated.overview.alertCount ? "Atender" : "OK"} stateTone={hydrated.overview.alertCount ? "yellow" : "green"} />
        <MetricItem icon={LockKeyhole} iconTone="neutral" label="Intentos de acceso" value={hydrated.events.filter((event) => event.category === "auth" && event.severity === "warning").length} state="Sesión" stateTone="neutral" />
        <MetricItem icon={Activity} iconTone="neutral" label="Integridad del entorno" value={`${100 - hydrated.overview.riskScore}%`} state="Lista" stateTone="green" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] bg-transparent p-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Actividad reciente</h2>
            <ActionButton emphasis="subtle">Ver todo</ActionButton>
          </div>
          <ActivityList items={activity} />
        </section>

        <section className="rounded-[28px] bg-transparent p-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Acciones rápidas</h2>
            <div className="flex gap-2">
              <ActionButton onClick={() => void handleRescan()}>Revalidar</ActionButton>
              <ActionButton emphasis="subtle" onClick={() => pushToast({ title: "Bloqueo preparado", description: "Usa el control superior para bloquear la sesión.", variant: "info" })}>Bloquear</ActionButton>
            </div>
          </div>
          <div className="space-y-2 rounded-[24px] bg-[var(--surface)] p-3 text-sm text-[var(--text-soft)]">
            <div className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2">
              <span>Estado de cifrado</span>
              <span className="text-[var(--ok)]">Desbloqueado</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2">
              <span>Cámara</span>
              <span className="text-[var(--text)]">Lista</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2">
              <span>Último escaneo</span>
              <span className="text-[var(--text)]">Hace 6 min</span>
            </div>
          </div>
        </section>
      </div>

      <DeviceSessionPanel current={current} devices={otherDevices} accesses={accessHistory} onViewHistory={() => pushToast({ title: "Historial", description: "Abre la sección de incidentes para ver el detalle completo.", variant: "info" })} />
    </div>
  );
}
