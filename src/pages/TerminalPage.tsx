import { useEffect, useMemo, useState } from "react";
import { Copy, Eraser, Shield, TerminalSquare } from "lucide-react";
import { ActionButton } from "@/components/security/ActionButton";
import { StatusChip } from "@/components/security/StatusChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import * as api from "@/services/security-api";
import { useUiStore } from "@/store/ui-store";
import type { TerminalCommandResult, TerminalStatus } from "@/types/security";

export function TerminalPage() {
  const pushToast = useUiStore((state) => state.pushToast);
  const [status, setStatus] = useState<TerminalStatus | null>(null);
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<TerminalCommandResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    void api.getTerminalStatus().then(setStatus).catch((error) => {
      pushToast({ title: "No se pudo cargar la terminal", description: error instanceof Error ? error.message : String(error), variant: "critical" });
    });
  }, [pushToast]);

  async function handleExecute(next?: string) {
    const value = (next ?? command).trim();
    if (!value) return;
    setBusy(true);
    try {
      const output = await api.runTerminalCommand(value);
      setResult(output);
      setHistory((current) => [value, ...current.filter((entry) => entry !== value)].slice(0, 20));
      setHistoryIndex(-1);
    } catch (error) {
      pushToast({ title: "Error de terminal", description: error instanceof Error ? error.message : String(error), variant: "critical" });
    } finally {
      setBusy(false);
    }
  }

  function handleHistory(step: "up" | "down") {
    if (!history.length) return;
    const nextIndex = step === "up" ? Math.min(history.length - 1, historyIndex + 1) : Math.max(-1, historyIndex - 1);
    setHistoryIndex(nextIndex);
    setCommand(nextIndex === -1 ? "" : history[nextIndex]);
  }

  const terminalOutput = useMemo(() => {
    if (!result) return status?.message ?? "";
    const parts = [result.stdout, result.stderr].filter(Boolean);
    return parts.length ? parts.join("\n") : `exit code: ${result.exitCode}`;
  }, [result, status]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Terminal" title="Terminal segura" description="Consola allowlist auditada." />

      {!status ? (
        <EmptyState icon={TerminalSquare} title="Terminal" description="No disponible" />
      ) : (
        <div className="space-y-4 rounded-2xl bg-transparent p-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip label="Allowlist activa" tone="green" leading="check" />
            <StatusChip label="Conexión permitida" tone="green" leading="check" />
            <StatusChip label="Sesión auditada" tone="green" leading="shield" />
          </div>

          <div className="rounded-2xl bg-[#050607] p-4 font-mono text-sm text-[#d5d8dc]">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/6 pb-3">
              <div className="inline-flex items-center gap-2 text-xs text-[#8f98a3]">
                <Shield aria-hidden="true" className="h-4 w-4" />
                PowerShell
              </div>
              <div className="flex gap-2">
                <ActionButton emphasis="subtle" icon={Copy} onClick={() => navigator.clipboard.writeText(terminalOutput)}>Copiar</ActionButton>
                <ActionButton emphasis="subtle" icon={Eraser} onClick={() => setResult(null)}>Limpiar</ActionButton>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                aria-label="Comando"
                className="h-12 flex-1 rounded-xl bg-[#101214] px-4 text-base text-[#f7f8fa] outline-none transition focus:ring-2 focus:ring-[var(--ring)]"
                placeholder="Comando"
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleExecute();
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    handleHistory("up");
                  }
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    handleHistory("down");
                  }
                }}
              />
              <ActionButton onClick={() => void handleExecute()} disabled={busy || !command.trim()}>Ejecutar</ActionButton>
            </div>

            <pre className="mt-4 min-h-[280px] overflow-auto rounded-xl bg-[#08090a] p-4 text-sm leading-6 text-[#c0c5ce]">{terminalOutput}</pre>
          </div>

          <div className="flex flex-wrap gap-2">
            {status.allowlist.slice(0, 6).map((entry) => (
              <button
                key={entry}
                type="button"
                className="cursor-pointer rounded-full bg-[var(--field)] px-3 py-2 text-sm text-[var(--text-soft)] hover:bg-[var(--field-hover)] hover:text-[var(--text)]"
                onClick={() => {
                  setCommand(entry);
                  void handleExecute(entry);
                }}
              >
                {entry}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
