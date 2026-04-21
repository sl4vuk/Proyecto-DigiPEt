const bytesFormatter = new Intl.NumberFormat("es-PE", {
  maximumFractionDigits: 1
});

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let value = bytes;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${bytesFormatter.format(value)} ${units[index]}`;
}

export function formatDateTime(date: string | number | Date | null | undefined) {
  if (!date) return "Sin registro";

  const resolved = new Date(date);
  if (Number.isNaN(resolved.getTime())) return "Fecha inválida";

  return resolved.toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function formatRelative(date: string | number | Date | null | undefined) {
  if (!date) return "Sin registro";

  const resolved = new Date(date);
  if (Number.isNaN(resolved.getTime())) return "Fecha inválida";

  const minutes = Math.round((resolved.getTime() - Date.now()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return rtf.format(hours, "hour");
  }

  const days = Math.round(hours / 24);
  return rtf.format(days, "day");
}

export function sentenceCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
