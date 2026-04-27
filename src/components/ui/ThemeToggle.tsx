import { MoonStar, MonitorCog, SunMedium } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/store/ui-store";

const options = [
  { value: "light", label: "Claro", icon: SunMedium },
  { value: "dark", label: "Oscuro", icon: MoonStar },
  { value: "system", label: "Sistema", icon: MonitorCog }
] as const;

export function ThemeToggle() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-1 shadow-[var(--shadow-soft)]" role="group" aria-label="Modo de tema">
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={theme === option.value}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium transition duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
              theme === option.value
                ? "bg-[var(--panel-strong)] text-[var(--text)]"
                : "text-[var(--text-soft)] hover:bg-[var(--panel-strong)] hover:text-[var(--text)]"
            )}
            onClick={() => setTheme(option.value)}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
