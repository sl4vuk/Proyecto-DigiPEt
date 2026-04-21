import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { FolderLock, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBytes, formatDateTime } from "@/lib/format";
import type { ProtectedItem } from "@/types/security";

interface ProtectedItemsTableProps {
  items: ProtectedItem[];
  selectedIds: string[];
  busy?: boolean;
  onSelectionChange: (ids: string[]) => void;
  onToggleLock: (ids: string[], locked: boolean) => void;
  onRemove: (ids: string[]) => void;
}

export function ProtectedItemsTable({
  items,
  selectedIds,
  busy,
  onSelectionChange,
  onToggleLock,
  onRemove
}: ProtectedItemsTableProps) {
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "file" | "directory">("all");
  const [integrityFilter, setIntegrityFilter] = useState<"all" | "verified" | "changed" | "missing">("all");
  const [sort, setSort] = useState<"updated" | "size" | "path">("updated");

  const filtered = useMemo(() => {
    const next = items.filter((item) => {
      const matchesQuery =
        !query ||
        item.path.toLowerCase().includes(query.toLowerCase()) ||
        (item.notes ?? "").toLowerCase().includes(query.toLowerCase());

      const matchesKind = kindFilter === "all" || item.kind === kindFilter;
      const matchesIntegrity =
        integrityFilter === "all" || item.integrityStatus === integrityFilter;

      return matchesQuery && matchesKind && matchesIntegrity;
    });

    next.sort((left, right) => {
      if (sort === "size") {
        return right.sizeBytes - left.sizeBytes;
      }
      if (sort === "path") {
        return left.path.localeCompare(right.path);
      }
      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });

    return next;
  }, [items, integrityFilter, kindFilter, query, sort]);

  if (!items.length) {
    return (
      <EmptyState
        icon={FolderLock}
        title="Todavía no hay activos protegidos"
        description="Agrega archivos o carpetas desde el panel superior y Aegis Vault registrará su estado, huella de integridad y política de bloqueo."
      />
    );
  }

  function toggle(id: string, checked: boolean) {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
      return;
    }
    onSelectionChange(selectedIds.filter((current) => current !== id));
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      onSelectionChange(filtered.map((item) => item.id));
      return;
    }
    onSelectionChange([]);
  }

  return (
    <Card
      title="Inventario protegido"
      description="Búsqueda, filtros, ordenamiento y acciones masivas sobre el registro local seguro."
      actions={
        selectedIds.length ? (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onToggleLock(selectedIds, true)}
              disabled={busy}
            >
              Bloquear selección
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleLock(selectedIds, false)}
              disabled={busy}
            >
              Desbloquear
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onRemove(selectedIds)}
              disabled={busy}
            >
              Quitar
            </Button>
          </>
        ) : null
      }
    >
      <div className="mb-4 grid gap-3 xl:grid-cols-[1.2fr_0.5fr_0.5fr_0.45fr]">
        <label className="flex items-center gap-3 border border-[var(--border)] bg-[var(--field)] px-4">
          <Search className="h-4 w-4 text-[var(--text-soft)]" />
          <input
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-soft)] placeholder:opacity-70"
            placeholder="Buscar por ruta o nota"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <Select
          value={kindFilter}
          onChange={setKindFilter}
          options={[
            { value: "all", label: "Todos los tipos" },
            { value: "file", label: "Archivos" },
            { value: "directory", label: "Carpetas" }
          ]}
        />

        <Select
          value={integrityFilter}
          onChange={setIntegrityFilter}
          options={[
            { value: "all", label: "Toda integridad" },
            { value: "verified", label: "Verificados" },
            { value: "changed", label: "Modificados" },
            { value: "missing", label: "Faltantes" }
          ]}
        />

        <Select
          value={sort}
          onChange={setSort}
          options={[
            { value: "updated", label: "Ordenar por actividad" },
            { value: "size", label: "Ordenar por tamaño" },
            { value: "path", label: "Ordenar por ruta" }
          ]}
        />
      </div>

      <div className="overflow-hidden border border-[var(--border)]">
        <div className="hidden grid-cols-[44px_1.5fr_0.45fr_0.45fr_0.45fr_0.4fr_0.7fr] gap-4 bg-[var(--panel)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)] lg:grid">
          <label className="grid place-items-center">
            <input
              type="checkbox"
              checked={Boolean(filtered.length) && filtered.every((item) => selectedIds.includes(item.id))}
              onChange={(event) => toggleAll(event.target.checked)}
            />
          </label>
          <span>Ruta</span>
          <span>Tipo</span>
          <span>Protección</span>
          <span>Integridad</span>
          <span>Tamaño</span>
          <span>Actividad</span>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 bg-[var(--field)] px-4 py-4 lg:grid-cols-[44px_1.5fr_0.45fr_0.45fr_0.45fr_0.4fr_0.7fr]"
            >
              <label className="grid place-items-start lg:place-items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={(event) => toggle(item.id, event.target.checked)}
                />
              </label>

              <div className="min-w-0">
                <p className="truncate font-medium">{item.path}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={item.locked ? "sealed" : "unlocked"}>
                    {item.locked ? "bloqueado" : "editable"}
                  </Badge>
                  {item.notes ? <Badge variant="neutral">{item.notes}</Badge> : null}
                </div>
              </div>

              <Cell><Badge variant="neutral">{item.kind}</Badge></Cell>
              <Cell><Badge variant="info">{item.protectionLevel}</Badge></Cell>
              <Cell><Badge variant={item.integrityStatus}>{item.integrityStatus}</Badge></Cell>
              <Cell>{formatBytes(item.sizeBytes)}</Cell>
              <Cell>{formatDateTime(item.updatedAt)}</Cell>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

interface CellProps {
  children: ReactNode;
}

function Cell({ children }: CellProps) {
  return (
    <div className="text-sm text-[var(--text-soft)] lg:flex lg:items-center">
      <span>{children}</span>
    </div>
  );
}

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
}

function Select<T extends string>({ value, onChange, options }: SelectProps<T>) {
  return (
    <select
      className="h-12 border border-[var(--border)] bg-[var(--field)] px-4 text-sm outline-none transition focus:border-[var(--text)] focus:ring-1 focus:ring-[var(--text)]"
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
