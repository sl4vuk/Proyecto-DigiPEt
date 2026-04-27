import { useEffect, useState } from "react";
import { Shield, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/i18n";
import * as api from "@/services/security-api";
import { useUiStore } from "@/store/ui-store";
import type { TerminalCommandResult, TerminalStatus } from "@/types/security";

export function TerminalPage() {
  const t = useI18n();
  const pushToast = useUiStore((state) => state.pushToast);
  const [status, setStatus] = useState<TerminalStatus | null>(null);
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<TerminalCommandResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api.getTerminalStatus().then(setStatus).catch((error) => {
      pushToast({
        title: "No se pudo cargar la terminal",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    });
  }, [pushToast]);

  async function handleExecute() {
    if (!command.trim()) return;

    setBusy(true);
    try {
      const next = await api.runTerminalCommand(command);
      setResult(next);
    } catch (error) {
      pushToast({
        title: "Ejecución no disponible",
        description: error instanceof Error ? error.message : String(error),
        variant: "warning"
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.pages.terminalEyebrow}
        title={t.pages.terminalTitle}
        description={t.pages.terminalDescription}
      />

      {!status ? (
        <EmptyState
          icon={TerminalSquare}
          title={t.terminal.stubTitle}
          description={t.terminal.unavailable}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Card title={t.terminal.stubTitle} description={status.message}>
            <div className="rounded-3xl border border-[var(--border)] bg-[#11161a] p-4 font-mono text-sm text-[#c5d3d6] shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 border-b border-white/8 pb-3 text-xs text-[#7f9397]">
                <Shield aria-hidden="true" className="h-4 w-4" />
                secure-shell stub
              </div>
              <div className="mt-4 flex flex-col gap-3 lg:flex-row">
                <input
                  aria-label={t.terminal.commandPlaceholder}
                  className="h-11 flex-1 rounded-2xl border border-white/10 bg-[#151c20] px-4 text-sm text-[#dbe7e9] outline-none transition focus:border-[#2f6b73]"
                  placeholder={t.terminal.commandPlaceholder}
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                />
                <Button onClick={() => void handleExecute()} disabled={busy || !command.trim()}>
                  {t.terminal.execute}
                </Button>
              </div>
              <pre className="mt-4 min-h-[220px] overflow-auto rounded-2xl border border-white/8 bg-[#0f1417] p-4 text-xs leading-6 text-[#9ab0b4]">
{result?.output ?? status.message}
              </pre>
            </div>
          </Card>

          <Card title={t.terminal.allowlist} description="La ejecución real deberá pasar por allowlist, permisos explícitos y comandos auditables.">
            <div className="grid gap-3">
              {status.allowlist.map((entry) => (
                <div key={entry} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-3 text-sm">
                  <span className="font-medium text-[var(--text)]">{entry}</span>
                  <span className="text-[var(--text-muted)]">stub</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
