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
    "border border-[var(--text)] bg-[var(--text)] text-[var(--bg)] hover:opacity-92",
  secondary:
    "border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)] hover:bg-[var(--field)]",
  ghost:
    "border border-[var(--border)] bg-transparent text-[var(--text-soft)] hover:bg-[var(--panel-strong)] hover:text-[var(--text)]",
  danger:
    "border border-[var(--border)] bg-[var(--danger-bg)] text-[var(--danger-text)] hover:bg-[var(--panel-strong)]"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-[18px] text-sm"
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
        "inline-flex items-center justify-center gap-2 rounded-none font-medium transition duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--text)] disabled:cursor-not-allowed disabled:opacity-55",
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
