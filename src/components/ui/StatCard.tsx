import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helper: string;
  tone?: "info" | "success" | "warning" | "critical";
}

export function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "info"
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-12 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
        <Badge variant={tone}>{label}</Badge>
      </div>
      <div className="mt-6">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        <p className="mt-2 text-pretty text-sm text-[var(--text-soft)]">{helper}</p>
      </div>
    </div>
  );
}
