import type { ComponentProps } from "react";
import { Button } from "@/components/ui/Button";

interface ActionButtonProps extends ComponentProps<typeof Button> {
  emphasis?: "default" | "danger" | "subtle";
}

export function ActionButton({ emphasis = "default", className, variant, ...props }: ActionButtonProps) {
  const nextVariant = emphasis === "danger" ? "danger" : variant ?? emphasis === "subtle" ? "ghost" : "secondary";
  return <Button size="md" variant={nextVariant} className={["h-11 rounded-2xl px-4 text-base", className ?? ""].join(" ")} {...props} />;
}
