import { useMemo, useState } from "react";
import { AlertTriangle, Download, Siren } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventList } from "@/features/events/EventList";
import { pickExportDestination } from "@/services/security-api";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";
import type { Severity } from "@/types/security";

export function IncidentsPage() {
  const hydrated = useSecurityStore((state) => state.hydrated);
  const exportEvents = useSecurityStore((state) => state.exportEvents);
  const emergencyLock = useSecurityStore((state) => state.emergencyLock);
  const pushToast = useUiStore((state) => state.pushToast);
  const [severity, setSeverity] = useState<"all" | Severity>("all");

  if (!hydrated) return null;

  const filtered = useMemo(() => {
    if (severity === "all") return hydrated.events;
    return hydrated.events.filter((event) => event.severity === severity);
  }, [hydrated.events, severity]);

  const criticalCount = hydrated.events.filter((event) => event.severity === "critical").length;
  const warningCount = hydrated.events.filter((event) => event.severity === "warning").length;

  async function handleExport() {
    try {
      const destination = await pickExportDestination();
      await exportEvents(destination ?? undefined);
    } catch (error) {
      pushToast({
        title: "No se pudo exportar el historial",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    }
  }

  async function handleEmergency() {
    try {
      await emergencyLock("Bloqueo de emergencia solicitado desde la vista de incidentes.");
    } catch (error) {
      pushToast({
        title: "No se pudo ejecutar el bloqueo de emergencia",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="incidents"
        title="Historial de eventos y respuesta"
        description="Trazabilidad de autenticación, integridad, actividad del core y alertas provenientes del módulo de cámara."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={() => void handleExport()}>
              Exportar logs
            </Button>
            <Button variant="danger" icon={Siren} onClick={() => void handleEmergency()}>
              Bloqueo de emergencia
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <Card title="Resumen de severidad" description="Estado consolidado de eventos de seguridad.">
          <div className="grid gap-4">
            <SeverityRow label="Críticos" value={criticalCount} variant="critical" />
            <SeverityRow label="Advertencias" value={warningCount} variant="warning" />
            <SeverityRow
              label="Informativos"
              value={hydrated.events.filter((event) => event.severity === "info").length}
              variant="info"
            />
            <label className="mt-2 flex flex-col gap-2">
              <span className="text-sm font-medium">Filtrar por severidad</span>
              <select
                className="h-12 border border-[var(--border)] bg-[var(--field)] px-4 text-sm outline-none"
                value={severity}
                onChange={(event) => setSeverity(event.target.value as "all" | Severity)}
              >
                <option value="all">Todas</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
            </label>
          </div>
        </Card>

        <Card title="Evento detallado" description="Últimos registros del motor de auditoría local.">
          <EventList events={filtered} />
        </Card>
      </div>
    </div>
  );
}

interface SeverityRowProps {
  label: string;
  value: number;
  variant: "critical" | "warning" | "info";
}

function SeverityRow({ label, value, variant }: SeverityRowProps) {
  return (
    <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--field)] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={variant}>{variant}</Badge>
        <span className="text-lg font-semibold tracking-tight">{value}</span>
      </div>
    </div>
  );
}
