import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends PropsWithChildren, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  fluid?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--field)] text-[var(--text)] hover:bg-[var(--field-hover)]",
  secondary: "bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--field)]",
  ghost: "bg-transparent text-[var(--text-soft)] hover:bg-[var(--surface)] hover:text-[var(--text)]",
  danger: "bg-[var(--surface-2)] text-[var(--danger)] hover:bg-[var(--field)]"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-3.5 text-sm",
  md: "h-11 px-4 text-base",
  lg: "h-12 px-5 text-base"
};

export function Button({ variant = "primary", size = "md", icon: Icon, children, className, fluid, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-55",
        variantStyles[variant],
        sizeStyles[size],
        fluid && "w-full",
        className
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className="h-5 w-5" /> : null}
      <span>{children}</span>
    </button>
  );
}
