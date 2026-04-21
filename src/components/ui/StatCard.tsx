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
    <div className="border border-[var(--border)] bg-[var(--panel-strong)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-12 w-12 place-items-center border border-[var(--border)] bg-[var(--field)] text-[var(--text)]">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant={tone}>{label}</Badge>
      </div>
      <div className="mt-6">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-2 text-sm text-[var(--text-soft)]">{helper}</p>
      </div>
    </div>
  );
}
