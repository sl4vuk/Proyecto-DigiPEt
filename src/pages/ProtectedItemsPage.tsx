import { FolderPlus, RefreshCcw, Upload } from "lucide-react";
import { useState } from "react";
import { ActionButton } from "@/components/security/ActionButton";
import { MetricItem } from "@/components/security/MetricItem";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProtectedItemsTable } from "@/features/items/ProtectedItemsTable";
import { pickDirectory, pickFiles } from "@/services/security-api";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";

export function ProtectedItemsPage() {
  const hydrated = useSecurityStore((state) => state.hydrated);
  const busy = useSecurityStore((state) => state.busy);
  const addItem = useSecurityStore((state) => state.addItem);
  const rescanIntegrity = useSecurityStore((state) => state.rescanIntegrity);
  const removeItems = useSecurityStore((state) => state.removeItems);
  const setItemsLocked = useSecurityStore((state) => state.setItemsLocked);
  const selectedIds = useSecurityStore((state) => state.selectedIds);
  const setSelection = useSecurityStore((state) => state.setSelection);
  const pushToast = useUiStore((state) => state.pushToast);
  const [adding, setAdding] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  if (!hydrated) return null;

  const hiddenCount = hiddenIds.length;
  const warningCount = hydrated.items.filter((item) => item.integrityStatus !== "verified").length;

  async function handleRescan() {
    try {
      await rescanIntegrity();
    } catch (error) {
      pushToast({ title: "No se pudo revalidar", description: error instanceof Error ? error.message : String(error), variant: "critical" });
    }
  }

  async function handleToggle(ids: string[], locked: boolean) {
    try {
      await setItemsLocked(ids, locked);
    } catch (error) {
      pushToast({ title: "No se pudo actualizar", description: error instanceof Error ? error.message : String(error), variant: "critical" });
    }
  }

  async function handleRemove(ids: string[]) {
    try {
      await removeItems(ids);
      setHiddenIds((current) => current.filter((id) => !ids.includes(id)));
    } catch (error) {
      pushToast({ title: "No se pudieron quitar", description: error instanceof Error ? error.message : String(error), variant: "critical" });
    }
  }

  async function handleAddFiles() {
    setAdding(true);
    try {
      const files = await pickFiles();
      for (const path of files) {
        await addItem({ path, kind: "file", protectionLevel: "strict" });
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleAddDirectory() {
    setAdding(true);
    try {
      const path = await pickDirectory();
      if (!path) return;
      await addItem({ path, kind: "directory", protectionLevel: "isolation" });
    } finally {
      setAdding(false);
    }
  }

  function handleToggleHidden(ids: string[], hidden: boolean) {
    setHiddenIds((current) => (hidden ? Array.from(new Set([...current, ...ids])) : current.filter((id) => !ids.includes(id))));
  }

  const visibleItems = showHidden ? hydrated.items : hydrated.items.filter((item) => !hiddenIds.includes(item.id));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Activos"
        title="Activos protegidos"
        description="Vista simple del inventario y su estado."
        actions={
          <>
            <ActionButton onClick={() => void handleAddFiles()} disabled={adding || busy}>Agregar</ActionButton>
            <ActionButton emphasis="subtle" icon={FolderPlus} onClick={() => void handleAddDirectory()} disabled={adding || busy}>Carpeta</ActionButton>
            <ActionButton emphasis="subtle" icon={RefreshCcw} onClick={() => void handleRescan()} disabled={busy}>Revalidar</ActionButton>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
        <MetricItem icon={Upload} iconTone="neutral" label="Activos" value={hydrated.items.length} state="OK" stateTone="green" />
        <MetricItem icon={FolderPlus} iconTone="neutral" label="Ocultos" value={hiddenCount} state={hiddenCount ? "Activo" : "Vacío"} stateTone={hiddenCount ? "yellow" : "neutral"} />
        <MetricItem icon={RefreshCcw} iconTone="neutral" label="Con cambios" value={warningCount} state={warningCount ? "Atender" : "OK"} stateTone={warningCount ? "yellow" : "green"} />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-soft)]">
        <span>Ocultos</span>
        <button type="button" className="text-[var(--text)]" onClick={() => setShowHidden((value) => !value)}>{showHidden ? "Cerrar" : "Abrir"}</button>
      </div>

      <ProtectedItemsTable
        items={visibleItems}
        events={hydrated.events}
        selectedIds={selectedIds}
        hiddenIds={hiddenIds}
        busy={busy}
        onSelectionChange={setSelection}
        onToggleLock={(ids, locked) => void handleToggle(ids, locked)}
        onToggleHidden={handleToggleHidden}
        onRemove={(ids) => void handleRemove(ids)}
        onOpenHistory={(path) => pushToast({ title: "Historial", description: path, variant: "info" })}
      />
    </div>
  );
}
