import { useState } from "react";
import { FolderPlus, RefreshCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
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

  if (!hydrated) return null;


  async function handleRescan() {
    try {
      await rescanIntegrity();
    } catch (error) {
      pushToast({
        title: "No se pudo revalidar la integridad",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    }
  }

  async function handleToggle(ids: string[], locked: boolean) {
    try {
      await setItemsLocked(ids, locked);
    } catch (error) {
      pushToast({
        title: locked ? "No se pudo bloquear la selección" : "No se pudo desbloquear la selección",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    }
  }

  async function handleRemove(ids: string[]) {
    try {
      await removeItems(ids);
    } catch (error) {
      pushToast({
        title: "No se pudieron quitar los elementos",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    }
  }

  async function handleAddFiles() {
    setAdding(true);
    try {
      const files = await pickFiles();
      for (const path of files) {
        await addItem({
          path,
          kind: "file",
          protectionLevel: "strict"
        });
      }

      if (files.length) {
        pushToast({
          title: "Activos agregados",
          description: `${files.length} archivo(s) incorporados al inventario protegido.`,
          variant: "success"
        });
      }
    } catch (error) {
      pushToast({
        title: "No se pudieron agregar archivos",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    } finally {
      setAdding(false);
    }
  }

  async function handleAddDirectory() {
    setAdding(true);
    try {
      const path = await pickDirectory();
      if (!path) return;

      await addItem({
        path,
        kind: "directory",
        protectionLevel: "isolation"
      });

      pushToast({
        title: "Carpeta protegida",
        description: path,
        variant: "success"
      });
    } catch (error) {
      pushToast({
        title: "No se pudo agregar la carpeta",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="inventory"
        title="Gestión de archivos y carpetas protegidas"
        description="Alta, baja, inspección, bloqueo masivo y filtros de operación sobre el inventario local."
        actions={
          <>
            <Button variant="secondary" icon={Upload} onClick={() => void handleAddFiles()} disabled={adding || busy}>
              Agregar archivos
            </Button>
            <Button variant="secondary" icon={FolderPlus} onClick={() => void handleAddDirectory()} disabled={adding || busy}>
              Agregar carpeta
            </Button>
            <Button icon={RefreshCcw} onClick={() => void handleRescan()} disabled={busy}>
              Revalidar integridad
            </Button>
          </>
        }
      />

      <ProtectedItemsTable
        items={hydrated.items}
        selectedIds={selectedIds}
        busy={busy}
        onSelectionChange={setSelection}
        onToggleLock={(ids, locked) => void handleToggle(ids, locked)}
        onRemove={(ids) => void handleRemove(ids)}
      />
    </div>
  );
}
