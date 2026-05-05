import { useMemo, useState } from "react";
import { Clock3, EyeOff, FolderLock, Search, ShieldCheck } from "lucide-react";
import { ActionButton } from "@/components/security/ActionButton";
import { StatusChip } from "@/components/security/StatusChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBytes, formatDateTime } from "@/lib/format";
import type { ProtectedItem, SecurityEvent } from "@/types/security";

interface ProtectedItemsTableProps {
  items: ProtectedItem[];
  events: SecurityEvent[];
  selectedIds: string[];
  hiddenIds: string[];
  busy?: boolean;
  onSelectionChange: (ids: string[]) => void;
  onToggleLock: (ids: string[], locked: boolean) => void;
  onToggleHidden: (ids: string[], hidden: boolean) => void;
  onRemove: (ids: string[]) => void;
  onOpenHistory: (path: string) => void;
}

export function ProtectedItemsTable({ items, events, selectedIds, hiddenIds, busy, onSelectionChange, onToggleLock, onToggleHidden, onRemove, onOpenHistory }: ProtectedItemsTableProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => items.filter((item) => !query || item.path.toLowerCase().includes(query.toLowerCase()) || (item.notes ?? "").toLowerCase().includes(query.toLowerCase())), [items, query]);

  if (!items.length) {
    return <EmptyState icon={FolderLock} title="Sin activos" description="Agrega un archivo o carpeta para comenzar." action={<ActionButton>Agregar</ActionButton>} />;
  }

  function toggleSelection(id: string) {
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);
  }

  return (
    <div className="space-y-4 rounded-[28px] bg-transparent p-1">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex h-12 min-w-[280px] items-center gap-3 rounded-2xl bg-[var(--field)] px-4 text-base text-[var(--text-soft)]">
          <Search aria-hidden="true" className="h-5 w-5" />
          <input aria-label="Buscar activo" className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]" placeholder="Buscar activo" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>

        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => onToggleLock(selectedIds, true)} disabled={busy || !selectedIds.length}>Bloquear</ActionButton>
          <ActionButton emphasis="subtle" onClick={() => onToggleLock(selectedIds, false)} disabled={busy || !selectedIds.length}>Desbloquear</ActionButton>
          <ActionButton emphasis="subtle" onClick={() => onToggleHidden(selectedIds, true)} disabled={busy || !selectedIds.length}>Ocultar</ActionButton>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((item) => {
          const hidden = hiddenIds.includes(item.id);
          const relatedEvents = events.filter((event) => event.path === item.path).length;
          return (
            <div key={item.id} className="grid gap-4 rounded-[24px] bg-[var(--surface)] px-4 py-4 xl:grid-cols-[auto_1.4fr_0.8fr_auto] xl:items-center">
              <label className="flex items-start gap-3 xl:items-center">
                <input type="checkbox" aria-label={`Seleccionar ${item.path}`} checked={selectedIds.includes(item.id)} onChange={() => toggleSelection(item.id)} />
                <div className="grid size-10 place-items-center rounded-xl text-[var(--text)]">
                  <FolderLock aria-hidden="true" className="h-5 w-5" />
                </div>
              </label>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-medium text-[var(--text)]">{item.path}</p>
                  {hidden ? <StatusChip label="Oculto" tone="neutral" leading="dot" /> : null}
                </div>
                <div className="mt-2 grid gap-2 text-sm text-[var(--text-soft)] md:grid-cols-2 xl:grid-cols-4">
                  <Meta label="Cifrado" value={item.locked ? "Protegido" : "En memoria"} />
                  <Meta label="Integridad" value={item.integrityStatus} />
                  <Meta label="Acceso" value={item.lastAccessedAt ? formatDateTime(item.lastAccessedAt) : "Sin registro"} />
                  <Meta label="Historial" value={`${relatedEvents}`} />
                </div>
              </div>

              <div className="grid gap-2 text-sm text-[var(--text-soft)]">
                <Meta label="Tipo" value={item.kind} />
                <Meta label="Tamaño" value={formatBytes(item.sizeBytes)} />
                <Meta label="Última act." value={formatDateTime(item.updatedAt)} />
              </div>

              <div className="flex flex-wrap gap-2 xl:justify-end">
                <ActionButton emphasis="subtle" icon={Clock3} onClick={() => onOpenHistory(item.path)}>Historial</ActionButton>
                <ActionButton emphasis="subtle" icon={EyeOff} onClick={() => onToggleHidden([item.id], !hidden)}>{hidden ? "Restaurar" : "Ocultar"}</ActionButton>
                <ActionButton icon={ShieldCheck} onClick={() => onToggleLock([item.id], !item.locked)}>{item.locked ? "Abrir" : "Bloquear"}</ActionButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-medium text-[var(--text)]">{value}</p>
    </div>
  );
}
