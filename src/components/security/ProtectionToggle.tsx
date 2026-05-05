import { ChevronRight, Eye, Bell, Globe, Grid2x2, KeyRound, LockKeyhole, Mail, Monitor, Shield, Sparkles, TabletSmartphone, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ProtectionOption } from "@/features/security/mock-data";

interface ProtectionToggleProps {
  option: ProtectionOption;
  onToggle?: () => void;
  onAction?: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  lock: LockKeyhole,
  pin: Shield,
  shield: Shield,
  key: KeyRound,
  passkey: Sparkles,
  mobile: TabletSmartphone,
  bell: Bell,
  desktop: Monitor,
  mail: Mail,
  refresh: Sparkles,
  globe: Globe,
  grid: Grid2x2,
  eye: Eye
};

export function ProtectionToggle({ option, onToggle, onAction }: ProtectionToggleProps) {
  const Icon = iconMap[option.icon] ?? Shield;
  const interactive = option.type === "toggle" ? onToggle : onAction;

  return (
    <button
      type="button"
      onClick={interactive}
      className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-none border-0 bg-transparent px-0 py-3 text-left shadow-none transition-none hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <Icon aria-hidden="true" className="h-6 w-6 shrink-0 stroke-[1.6] text-[var(--text-soft)] group-hover:text-[var(--text)]" />
      <span className="min-w-0 truncate text-base font-semibold tracking-[-0.02em] text-[var(--text)]">{option.title}</span>
      {option.type === "toggle" ? (
        <span
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-[var(--surface-soft)] transition-none",
            option.enabled ? "text-[var(--accent-cyan)]" : "text-[var(--text-muted)]"
          )}
          aria-hidden="true"
        >
          <span className={cn("inline-block h-5 w-5 rounded-full bg-current transition-transform", option.enabled ? "translate-x-6" : "translate-x-1")} />
        </span>
      ) : (
        <ChevronRight aria-hidden="true" className="h-5 w-5 text-[var(--text-muted)]" />
      )}
    </button>
  );
}
