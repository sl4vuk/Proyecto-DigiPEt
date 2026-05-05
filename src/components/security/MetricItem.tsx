import type { LucideIcon } from "lucide-react";

interface MetricItemProps {
  icon: LucideIcon;
  iconTone: "blue" | "green" | "yellow" | "red" | "violet" | "neutral";
  label: string;
  value: string | number;
  state: string;
  stateTone: "blue" | "green" | "yellow" | "red" | "violet" | "neutral";
  helper?: string;
}

function toneColor(tone: MetricItemProps["stateTone"]) {
  if (tone === "green") return "var(--ok)";
  if (tone === "yellow") return "var(--warning)";
  if (tone === "red") return "var(--danger)";
  return "var(--text-muted)";
}

export function MetricItem({ icon: Icon, label, value, state, stateTone, helper }: MetricItemProps) {
  const color = toneColor(stateTone);

  return (
    <div className="flex min-w-0 items-start gap-4 rounded-3xl bg-transparent px-1 py-2">
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl text-[var(--text)]">
        <Icon aria-hidden="true" className="h-7 w-7" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-base font-medium text-[var(--text)]">{label}</p>
          <span className="inline-flex items-center gap-1.5 text-sm" style={{ color }}>
            <span className="block size-2 rounded-full" style={{ backgroundColor: color }} />
            {state}
          </span>
        </div>
        <p className="mt-2 text-[2.25rem] font-semibold tracking-tight tabular-nums text-[var(--text)]">{value}</p>
        {helper ? <p className="mt-1 text-sm text-[var(--text-soft)]">{helper}</p> : null}
      </div>
    </div>
  );
}
