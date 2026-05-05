import { ChevronRight, Eye, Fingerprint, KeyRound, LockKeyhole, ScanFace, Shield, ShieldEllipsis, Sparkles, type LucideIcon } from "lucide-react";
import type { UnlockMethodOption } from "@/features/security/mock-data";

interface MethodCardProps {
  method: UnlockMethodOption;
  selected?: boolean;
  onClick?: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  lock: LockKeyhole,
  pin: ShieldEllipsis,
  face: ScanFace,
  fingerprint: Fingerprint,
  shield: Shield,
  key: KeyRound,
  passkey: Sparkles,
  phrase: Eye
};

export function MethodCard({ method, selected, onClick }: MethodCardProps) {
  const Icon = iconMap[method.icon] ?? Shield;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full items-center justify-between rounded-none border-0 bg-transparent px-0 py-4 text-left shadow-none transition-none",
        "hover:text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        selected ? "text-[var(--accent-cyan)]" : "text-[var(--text)]"
      ].join(" ")}
    >
      <span className="inline-flex min-w-0 items-center gap-4">
        <Icon aria-hidden="true" className="h-7 w-7 shrink-0 stroke-[1.6]" />
        <span className="truncate text-lg font-semibold tracking-[-0.03em]">{method.title}</span>
      </span>
      <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--text-muted)]" />
    </button>
  );
}
