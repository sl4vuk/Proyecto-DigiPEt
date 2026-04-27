import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string | null;
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon: Icon, className, ...props },
  ref
) {
  const describedBy = [props.id ? `${props.id}-hint` : undefined, props.id && error ? `${props.id}-error` : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="flex w-full flex-col gap-2">
      {label ? <span className="text-sm font-medium text-[var(--text)]">{label}</span> : null}
      <span
        className={cn(
          "flex h-11 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--field)] px-4 text-sm transition focus-within:border-[var(--border-strong)] focus-within:bg-[var(--panel)] focus-within:ring-2 focus-within:ring-[var(--ring)]",
          error && "border-[var(--danger-text)] focus-within:border-[var(--danger-text)] focus-within:ring-[rgba(165,14,14,0.12)]",
          className
        )}
      >
        {Icon ? <Icon aria-hidden="true" className="h-4 w-4 text-[var(--text-soft)]" /> : null}
        <input
          ref={ref}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className="h-full w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
          {...props}
        />
      </span>
      {error ? <span id={props.id ? `${props.id}-error` : undefined} className="text-xs text-[var(--danger-text)]">{error}</span> : null}
      {!error && hint ? <span id={props.id ? `${props.id}-hint` : undefined} className="text-xs text-[var(--text-soft)]">{hint}</span> : null}
    </label>
  );
});
