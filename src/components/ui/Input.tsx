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
  return (
    <label className="flex w-full flex-col gap-2">
      {label ? <span className="text-sm font-medium text-[var(--text)]">{label}</span> : null}
      <span
        className={cn(
          "flex h-12 items-center gap-3 border border-[var(--border)] bg-[var(--field)] px-4 text-sm transition focus-within:border-[var(--text)] focus-within:ring-1 focus-within:ring-[var(--text)]",
          error && "border-[var(--text)]",
          className
        )}
      >
        {Icon ? <Icon className="h-4 w-4 text-[var(--text-soft)]" /> : null}
        <input
          ref={ref}
          className="h-full w-full bg-transparent outline-none placeholder:text-[var(--text-soft)] placeholder:opacity-70"
          {...props}
        />
      </span>
      {error ? <span className="text-xs text-[var(--text)]">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-[var(--text-soft)]">{hint}</span> : null}
    </label>
  );
});
