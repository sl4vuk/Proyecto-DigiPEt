import { MoonStar, MonitorCog, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/ui-store";

const order = ["dark", "light", "system"] as const;

export function ThemeToggle() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  const next = order[(order.indexOf(theme) + 1) % order.length];
  const Icon =
    theme === "dark" ? MoonStar : theme === "light" ? SunMedium : MonitorCog;

  return (
    <Button
      variant="ghost"
      icon={Icon}
      onClick={() => setTheme(next)}
      title={`Cambiar tema (${theme})`}
    >
      {theme === "system" ? "Sistema" : theme === "dark" ? "Oscuro" : "Claro"}
    </Button>
  );
}
