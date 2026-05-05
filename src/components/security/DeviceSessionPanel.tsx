import { History, Laptop, MapPin, Monitor, MoreHorizontal, ShieldX, Smartphone, Wifi } from "lucide-react";
import { ActionButton } from "@/components/security/ActionButton";
import { StatusChip } from "@/components/security/StatusChip";
import type { AccessEntry, DeviceSession } from "@/features/security/mock-data";

interface CurrentSessionInfo {
  startedAt: string;
  device: string;
  ip: string;
  location: string;
  mac: string;
  method: string;
}

interface DeviceSessionPanelProps {
  current: CurrentSessionInfo;
  devices: DeviceSession[];
  accesses: AccessEntry[];
  onRemoveDevice?: () => void;
  onCloseUnknown?: () => void;
  onViewHistory?: () => void;
}

function deviceIcon(type: DeviceSession["icon"]) {
  return type === "mobile" ? Smartphone : type === "laptop" ? Laptop : Monitor;
}

export function DeviceSessionPanel({ current, devices, accesses, onRemoveDevice, onCloseUnknown, onViewHistory }: DeviceSessionPanelProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[28px] bg-transparent p-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Sesión actual</h3>
            <p className="mt-1 text-sm text-[var(--text-soft)]">Dispositivo principal y actividad reciente.</p>
          </div>
          <div className="flex gap-2">
            <ActionButton emphasis="subtle" icon={History} onClick={onViewHistory}>Historial</ActionButton>
            <button type="button" aria-label="Más acciones" className="grid size-11 place-items-center rounded-2xl bg-[var(--field)] text-[var(--text-soft)]">
              <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 rounded-[24px] bg-[var(--surface)] p-4 xl:grid-cols-[1fr_auto]">
          <dl className="grid gap-3 text-sm">
            <Row label="Sesión" value={current.startedAt} />
            <Row label="Dispositivo" value={current.device} />
            <Row label="IP" value={current.ip} />
            <Row label="Ubicación" value={current.location} />
            <Row label="MAC" value={current.mac} />
          </dl>
          <div className="flex flex-col gap-2 xl:w-[180px]">
            <ActionButton emphasis="danger" icon={ShieldX} onClick={onRemoveDevice}>Quitar</ActionButton>
            <ActionButton emphasis="subtle" onClick={onCloseUnknown}>Cerrar sospechosa</ActionButton>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {devices.slice(0, 3).map((device) => {
            const Icon = deviceIcon(device.icon);
            return (
              <div key={device.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl px-2 py-3 hover:bg-[var(--surface)]">
                <div className="grid size-10 place-items-center rounded-xl text-[var(--text)]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[var(--text)]">{device.name}</p>
                  <p className="truncate text-sm text-[var(--text-soft)]">{device.location} · {device.ip}</p>
                </div>
                <StatusChip label={device.state} tone={device.state === "Sospechosa" ? "red" : device.state === "Activa ahora" ? "green" : "neutral"} leading="dot" />
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-1">
          {accesses.slice(0, 3).map((entry) => (
            <div key={entry.id} className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-3 rounded-2xl px-2 py-3 hover:bg-[var(--surface)]">
              <div className="text-sm text-[var(--text)]">{entry.location}</div>
              <div className="text-sm text-[var(--text-soft)]">{entry.ip}</div>
              <div className="text-sm text-[var(--text-soft)]">{entry.device}</div>
              <StatusChip label={entry.severity} tone={entry.severity === "Warning" ? "yellow" : entry.severity === "Critical" ? "red" : "green"} leading="dot" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-transparent p-1">
        <div className="flex items-center gap-3 text-[var(--text)]">
          <div className="grid size-12 place-items-center rounded-2xl text-[var(--ok)]">
            <Wifi aria-hidden="true" className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Controles de sesión</h3>
            <p className="text-sm text-[var(--text-soft)]">Solo lo esencial.</p>
          </div>
        </div>
        <div className="mt-6 space-y-2 rounded-[24px] bg-[var(--surface)] p-3">
          <Row label="Dispositivo" value={current.device} />
          <Row label="IP" value={current.ip} />
          <Row label="Ubicación" value={current.location} />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl px-2 py-2">
      <dt className="inline-flex items-center gap-2 text-[var(--text-soft)]">
        <MapPin aria-hidden="true" className="h-4 w-4 opacity-70" />
        {label}
      </dt>
      <dd className="font-medium text-[var(--text)]">{value}</dd>
    </div>
  );
}
