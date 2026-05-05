import { useMemo } from "react";
import { DeviceSessionPanel } from "@/components/security/DeviceSessionPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { useSecurityStore } from "@/store/security-store";

export function SessionsPage() {
  const hydrated = useSecurityStore((state) => state.hydrated);
  const emergencyLock = useSecurityStore((state) => state.emergencyLock);
  const { systemInfo } = useSystemInfo();

  if (!hydrated) return null;

  const current = {
    startedAt: hydrated.session?.unlockedAt ? new Date(hydrated.session.unlockedAt).toLocaleString("es-PE") : "No disponible",
    device: systemInfo.deviceName || systemInfo.osName || "No disponible",
    ip: systemInfo.localIp ?? "No disponible",
    location: systemInfo.location ?? "Local",
    mac: systemInfo.macAddresses[0] ?? "No disponible",
    method: hydrated.session?.method ?? "pin",
  };

  const accessEntries = useMemo(
    () =>
      hydrated.events
        .filter((event) => event.category === "auth")
        .slice(0, 8)
        .map((event): { id: string; location: string; ip: string; device: string; timestamp: string; severity: "OK" | "Warning" | "Critical" } => ({
          id: event.id,
          location: event.metadata?.location ?? systemInfo.location ?? "Local",
          ip: event.metadata?.localIp ?? systemInfo.localIp ?? "No disponible",
          device: event.metadata?.deviceType ?? systemInfo.deviceName ?? "No disponible",
          timestamp: new Date(event.timestamp).toLocaleString("es-PE"),
          severity: event.severity === "critical" ? "Critical" : event.severity === "warning" ? "Warning" : "OK",
        })),
    [hydrated.events, systemInfo]
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sesiones" title="Sesión actual" description="Dispositivo principal y actividad reciente." />
      <DeviceSessionPanel
        current={current}
        devices={[]}
        accesses={accessEntries}
        onRemoveDevice={() => { if (window.confirm("¿Quitar este dispositivo?")) void emergencyLock("Dispositivo actual retirado por el usuario."); }}
        onCloseUnknown={() => { if (window.confirm("¿Cerrar sesiones sospechosas?")) void emergencyLock("Sesiones sospechosas cerradas por el usuario."); }}
        onViewHistory={() => undefined}
      />
    </div>
  );
}
