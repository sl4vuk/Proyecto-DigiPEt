import {
  Activity,
  FolderLock,
  LockKeyhole,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EventList } from "@/features/events/EventList";
import { formatDateTime, formatRelative } from "@/lib/format";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";

export function DashboardPage() {
  const hydrated = useSecurityStore((state) => state.hydrated);
  const rescanIntegrity = useSecurityStore((state) => state.rescanIntegrity);
  const pushToast = useUiStore((state) => state.pushToast);

  if (!hydrated) return null;

  async function handleRescan() {
    try {
      await rescanIntegrity();
    } catch (error) {
      pushToast({
        title: "No se pudo completar el escaneo",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    }
  }

  const latestItem = hydrated.items[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="dashboard"
        title="Postura general del entorno"
        description="Resumen ejecutivo del estado seguro, integridad local y actividad reciente del equipo."
        actions={
          <>
            <Badge variant={hydrated.overview.riskLabel}>{hydrated.overview.riskLabel}</Badge>
            <Button variant="secondary" onClick={() => void handleRescan()}>
              Re-escanear integridad
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard
          icon={FolderLock}
          label="Activos"
          value={hydrated.overview.protectedItems}
          helper="Archivos y carpetas bajo observación o bloqueo."
          tone="info"
        />
        <StatCard
          icon={LockKeyhole}
          label="Bloqueados"
          value={hydrated.overview.lockedItems}
          helper="Elementos con política de bloqueo aplicada."
          tone="success"
        />
        <StatCard
          icon={ShieldAlert}
          label="Alertas"
          value={hydrated.overview.alertCount}
          helper="Eventos warning o critical pendientes de revisar."
          tone={hydrated.overview.alertCount ? "warning" : "success"}
        />
        <StatCard
          icon={Activity}
          label="Riesgo"
          value={`${hydrated.overview.riskScore}%`}
          helper={`Último escaneo: ${formatDateTime(hydrated.overview.lastScanAt)}`}
          tone={
            hydrated.overview.riskLabel === "critical"
              ? "critical"
              : hydrated.overview.riskLabel === "high"
                ? "warning"
                : "info"
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Card
          title="Actividad reciente"
          description="Registro inmediato de lo que ocurrió en la sesión actual y auditorías locales."
        >
          <EventList events={hydrated.events} limit={5} />
        </Card>

        <div className="space-y-5">
          <Card
            title="Resumen operativo"
            description="Indicadores clave de sesión, cifrado y vigilancia."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Metric
                label="Estado de cifrado"
                value={hydrated.overview.encryptionStatus}
                helper="La bóveda está cargada solo en memoria mientras la sesión esté abierta."
              />
              <Metric
                label="Cámara"
                value={hydrated.overview.cameraStatus}
                helper="Módulo desacoplado, activable desde ajustes."
              />
              <Metric
                label="Sesión iniciada"
                value={formatDateTime(hydrated.session?.unlockedAt)}
                helper={hydrated.session ? `Método: ${hydrated.session.method}` : "Sin sesión"}
              />
              <Metric
                label="Actividad reciente"
                value={hydrated.overview.recentActivity}
                helper="Eventos registrados en la ventana reciente."
              />
            </div>
          </Card>

          <Card
            title="Último activo inspeccionado"
            description="Vista rápida del último elemento dentro del inventario seguro."
            actions={latestItem ? <Badge variant={latestItem.integrityStatus}>{latestItem.integrityStatus}</Badge> : null}
          >
            {latestItem ? (
              <div className="space-y-2">
                <p className="font-medium">{latestItem.path}</p>
                <p className="text-sm text-[var(--text-soft)]">
                  Protección {latestItem.protectionLevel}, {latestItem.locked ? "bloqueado" : "editable"}.
                </p>
                <p className="text-sm text-[var(--text-soft)]">
                  Última actividad {formatRelative(latestItem.updatedAt)}.
                </p>
              </div>
            ) : (
                <div className="border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--text-soft)]">
                  Todavía no existe un activo protegido. Usa la vista de gestión para comenzar.
                </div>
            )}
          </Card>
        </div>
      </div>

      <Card
        title="Recomendaciones inmediatas"
        description="Checklist corto para fortalecer la demo y el hardening inicial."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Recommendation
            title="Escaneo periódico"
            description="Programa revisiones tras agregar o modificar activos para refrescar huellas de integridad."
          />
          <Recommendation
            title="Módulo de cámara"
            description="Actívalo solo en puestos que realmente necesiten gestos o presencia visual."
          />
          <Recommendation
            title="Rotación de credencial"
            description="Realiza rotación del PIN maestro cuando la estación cambie de operador."
          />
        </div>
      </Card>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string | number;
  helper: string;
}

function Metric({ label, value, helper }: MetricProps) {
  return (
    <div className="border border-[var(--border)] bg-[var(--field)] p-4">
      <p className="text-sm text-[var(--text-soft)]">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{helper}</p>
    </div>
  );
}

interface RecommendationProps {
  title: string;
  description: string;
}

function Recommendation({ title, description }: RecommendationProps) {
  return (
    <div className="border border-[var(--border)] bg-[var(--field)] p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <p className="font-medium">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
    </div>
  );
}
