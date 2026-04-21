import type { HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function Card({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        "border border-[var(--border)] bg-[var(--panel-strong)] p-5",
        className
      )}
      {...props}
    >
      {title || description || actions ? (
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <h3 className="text-lg font-semibold tracking-tight">{title}</h3> : null}
            {description ? (
              <p className="mt-1 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
