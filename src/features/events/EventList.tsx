import { Laptop, Monitor, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/format";
import type { SecurityEvent } from "@/types/security";

interface EventListProps {
  events: SecurityEvent[];
  limit?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function EventList({
  events,
  limit,
  emptyTitle = "No hay eventos registrados",
  emptyDescription = "Cuando exista actividad relevante, la verás reflejada aquí con severidad y contexto."
}: EventListProps) {
  const items = typeof limit === "number" ? events.slice(0, limit) : events;

  if (!items.length) {
    return (
      <EmptyState
        icon={ShieldQuestion}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((event) => (
        <div
          key={event.id}
          className="rounded-3xl border border-[var(--border)] bg-[var(--panel-strong)] p-4 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid size-10 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-[var(--text)]">
                {event.severity === "critical" ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold tracking-tight">{event.title}</p>
                  <Badge variant={event.severity}>{event.severity}</Badge>
                  <Badge variant="neutral">{event.category}</Badge>
                </div>
                <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">
                  {event.description}
                </p>
                {event.metadata && Object.keys(event.metadata).length > 0 ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <MetadataRow key={key} eventKey={key} value={value} />
                    ))}
                  </div>
                ) : null}
                {event.path ? (
                  <p className="mt-2 break-all text-xs text-[var(--text-soft)]">
                    Ruta: <span className="text-[var(--text)]">{event.path}</span>
                  </p>
                ) : null}
              </div>
            </div>
            <p className="text-sm text-[var(--text-soft)]">{formatDateTime(event.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

interface MetadataRowProps {
  eventKey: string;
  value: string;
}

function MetadataRow({ eventKey, value }: MetadataRowProps) {
  const labelMap: Record<string, string> = {
    authMethod: "Método",
    deviceType: "Dispositivo",
    hostname: "Hostname",
    os: "Sistema",
    username: "Usuario",
    localIp: "IP local",
    status: "Estado",
    failedAttempts: "Intentos",
    gesture: "Gesto",
    suspectedIntrusion: "Intrusión"
  };

  const Icon = eventKey === "deviceType" ? (value === "laptop" ? Laptop : Monitor) : null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--panel)] px-3 py-2 text-xs text-[var(--text-soft)]">
      <span className="inline-flex items-center gap-2">
        {Icon ? <Icon aria-hidden="true" className="h-3.5 w-3.5" /> : null}
        <span>{labelMap[eventKey] ?? eventKey}</span>
      </span>
      <span className="max-w-[55%] truncate font-medium text-[var(--text)]">{value}</span>
    </div>
  );
}
