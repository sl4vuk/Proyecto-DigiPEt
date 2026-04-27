import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="grid min-h-[260px] place-items-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel-strong)] px-6 py-10 text-center shadow-[var(--shadow-soft)]">
      <div className="max-w-md">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-[var(--text)]">
          <Icon aria-hidden="true" className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-pretty text-sm leading-6 text-[var(--text-soft)]">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
