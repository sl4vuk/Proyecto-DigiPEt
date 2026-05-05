import { Bell, Eye, Globe, LockKeyhole, Mail, Monitor, Shield, Sparkles, type LucideIcon } from "lucide-react";
import { StatusChip } from "@/components/security/StatusChip";
import type { SecurityControlItem } from "@/features/security/mock-data";

interface SecurityControlsListProps {
  items: SecurityControlItem[];
}

const iconMap: Record<string, LucideIcon> = {
  bell: Bell,
  eye: Eye,
  globe: Globe,
  lock: LockKeyhole,
  mail: Mail,
  desktop: Monitor,
  shield: Shield,
  refresh: Sparkles
};

export function SecurityControlsList({ items }: SecurityControlsListProps) {
  return (
    <div className="rounded-[28px] bg-transparent p-1">
      <h3 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Controles</h3>
      <div className="mt-3 space-y-1">
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? Shield;
          return (
            <button key={item.id} type="button" className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl px-2 py-3 text-left hover:bg-[var(--surface)]">
              <div className="grid size-10 place-items-center rounded-xl text-[var(--text)]">
                <Icon aria-hidden="true" className="h-5 w-5" style={{ color: item.accent === "green" ? "var(--ok)" : item.accent === "yellow" ? "var(--warning)" : item.accent === "red" ? "var(--danger)" : "var(--text-muted)" }} />
              </div>
              <div>
                <p className="font-medium text-[var(--text)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--text-soft)]">{item.description}</p>
              </div>
              <StatusChip label={item.state} tone={item.accent === "green" ? "green" : item.accent === "yellow" ? "yellow" : item.accent === "red" ? "red" : "neutral"} leading="dot" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
