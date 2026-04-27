import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonProps
  extends PropsWithChildren,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  fluid?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-[var(--border-strong)] bg-[var(--panel)] text-[var(--text)] shadow-[var(--shadow-soft)] hover:bg-[var(--panel-strong)]",
  secondary:
    "border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)] hover:bg-[var(--field-hover)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--text-soft)] hover:border-[var(--border)] hover:bg-[var(--panel-strong)] hover:text-[var(--text)]",
  danger:
    "border border-transparent bg-[var(--danger-bg)] text-[var(--danger-text)] hover:opacity-95"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-4 text-sm"
};

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  children,
  className,
  fluid,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-55",
        variantStyles[variant],
        sizeStyles[size],
        fluid && "w-full",
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </button>
  );
}
