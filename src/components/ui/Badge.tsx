import type { PropsWithChildren } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
  | "info"
  | "warning"
  | "critical"
  | "success"
  | "low"
  | "moderate"
  | "high"
  | "neutral"
  | "verified"
  | "changed"
  | "missing"
  | "sealed"
  | "unlocked";

interface BadgeProps extends PropsWithChildren {
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  info: "bg-[var(--panel-strong)] text-[var(--text)] ring-[var(--border)]",
  warning: "bg-[var(--warning-bg)] text-[var(--warning-text)] ring-[var(--border)]",
  critical: "bg-[var(--danger-bg)] text-[var(--danger-text)] ring-[var(--border)]",
  success: "bg-[var(--success-bg)] text-[var(--success-text)] ring-[var(--border)]",
  low: "bg-[var(--success-bg)] text-[var(--success-text)] ring-[var(--border)]",
  moderate: "bg-[var(--warning-bg)] text-[var(--warning-text)] ring-[var(--border)]",
  high: "bg-[var(--danger-bg)] text-[var(--danger-text)] ring-[var(--border)]",
  neutral: "bg-[var(--panel-strong)] text-[var(--text-soft)] ring-[var(--border)]",
  verified: "bg-[var(--success-bg)] text-[var(--success-text)] ring-[var(--border)]",
  changed: "bg-[var(--warning-bg)] text-[var(--warning-text)] ring-[var(--border)]",
  missing: "bg-[var(--danger-bg)] text-[var(--danger-text)] ring-[var(--border)]",
  sealed: "bg-[var(--panel-strong)] text-[var(--text-soft)] ring-[var(--border)]",
  unlocked: "bg-[var(--text)] text-[var(--bg)] ring-[var(--text)]"
};

export function Badge({
  variant = "neutral",
  className,
  children
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
