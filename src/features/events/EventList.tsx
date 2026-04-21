import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
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
          className="border border-[var(--border)] bg-[var(--field)] p-4"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-10 w-10 place-items-center border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
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
