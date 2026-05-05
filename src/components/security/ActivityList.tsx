import { AlertTriangle, CheckCircle2, Info, Shield } from "lucide-react";
import type { DashboardActivityItem } from "@/features/security/mock-data";

interface ActivityListProps {
  items: DashboardActivityItem[];
  compact?: boolean;
}

const iconBySeverity = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  critical: Shield,
  ok: CheckCircle2
};

function toneColor(severity: DashboardActivityItem["severity"]) {
  if (severity === "warning") return "var(--warning)";
  if (severity === "critical") return "var(--danger)";
  if (severity === "success") return "var(--ok)";
  return "var(--text-muted)";
}

export function ActivityList({ items, compact }: ActivityListProps) {
  return (
    <div className="space-y-1">
      {items.slice(0, 5).map((item) => {
        const Icon = iconBySeverity[item.severity];
        const color = toneColor(item.severity);
        return (
          <div key={item.id} className={["grid items-start gap-3 rounded-2xl px-2 py-3 hover:bg-[var(--surface)]", compact ? "grid-cols-[auto_1fr]" : "grid-cols-[auto_1fr_auto]"].join(" ")}>
            <div className="mt-0.5 grid size-9 place-items-center rounded-xl text-[var(--text)]">
              <Icon aria-hidden="true" className="h-5 w-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-[var(--text)]">{item.title}</p>
              {!compact ? <p className="mt-1 text-sm text-[var(--text-soft)]">{item.description}</p> : null}
            </div>
            {!compact ? <p className="text-right text-sm text-[var(--text-soft)]">{item.timestamp}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
