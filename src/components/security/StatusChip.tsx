import { CircleDot, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "cyan" | "yellow" | "red" | "neutral" | "ok";

interface StatusChipProps {
  label: string;
  tone?: Tone | "blue" | "green" | "violet";
  leading?: "dot" | "check" | "shield" | "star";
  className?: string;
}

const toneStyles: Record<string, string> = {
  cyan: "text-[var(--accent-cyan)]",
  ok: "text-[var(--accent-cyan)]",
  green: "text-[var(--accent-cyan)]",
  blue: "text-[var(--accent-cyan)]",
  yellow: "text-[var(--accent-yellow)]",
  red: "text-[var(--accent-red)]",
  violet: "text-[var(--text)]",
  neutral: "text-[var(--text-muted)]"
};

const icons = {
  dot: CircleDot,
  check: ShieldCheck,
  shield: ShieldCheck,
  star: Star
};

export function StatusChip({ label, tone = "neutral", leading = "dot", className }: StatusChipProps) {
  const Icon = icons[leading];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-transparent px-0 py-0 text-xs font-medium leading-none",
        toneStyles[tone] ?? toneStyles.neutral,
        className
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  );
}
