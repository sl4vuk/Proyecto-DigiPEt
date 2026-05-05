import type { HydratedAppState, SessionSnapshot, Severity } from "@/types/security";

export type MethodState = "Activo" | "Disponible" | "Recomendado";
export type MethodAccent = "green" | "blue" | "yellow" | "red" | "violet" | "neutral";

export interface UnlockMethodOption {
  id: string;
  title: string;
  description: string;
  state: MethodState;
  accent: MethodAccent;
  icon: string;
  active?: boolean;
  recommended?: boolean;
}

export interface ProtectionOption {
  id: string;
  title: string;
  icon: string;
  type: "toggle" | "action";
  enabled: boolean;
}

export interface SecurityProfile {
  id: string;
  title: string;
  description: string;
  methods: string[];
  protections: string[];
}

export interface DeviceSession {
  id: string;
  name: string;
  client: string;
  location: string;
  ip: string;
  timestamp: string;
  state: "Activa ahora" | "Reciente" | "Sospechosa";
  icon: "desktop" | "laptop" | "mobile";
  trusted?: boolean;
}

export interface AccessEntry {
  id: string;
  location: string;
  ip: string;
  device: string;
  timestamp: string;
  severity: "OK" | "Warning" | "Critical";
}

export interface SecurityControlItem {
  id: string;
  title: string;
  description: string;
  state: string;
  accent: MethodAccent;
  icon: string;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: Severity | "ok";
}

export const unlockMethods: UnlockMethodOption[] = [
  {
    id: "password",
    title: "Contraseña",
    description: "Usa una contraseña fuerte para tu cuenta.",
    state: "Activo",
    accent: "green",
    icon: "lock",
    active: true
  },
  {
    id: "pin",
    title: "PIN",
    description: "PIN local de 6 dígitos para acceso rápido.",
    state: "Activo",
    accent: "green",
    icon: "pin",
    active: true
  },
  {
    id: "face",
    title: "Biometría facial",
    description: "Desbloqueo con reconocimiento facial del dispositivo.",
    state: "Disponible",
    accent: "violet",
    icon: "face"
  },
  {
    id: "fingerprint",
    title: "Huella dactilar",
    description: "Desbloqueo rápido con tu huella digital.",
    state: "Activo",
    accent: "green",
    icon: "fingerprint",
    active: true
  },
  {
    id: "2fa",
    title: "2FA",
    description: "Verificación en dos pasos con app autenticadora.",
    state: "Activo",
    accent: "green",
    icon: "shield",
    active: true
  },
  {
    id: "yubikey",
    title: "YubiKey",
    description: "Llave de seguridad física FIDO2/WebAuthn.",
    state: "Disponible",
    accent: "blue",
    icon: "key"
  },
  {
    id: "passkeys",
    title: "Passkeys",
    description: "Acceso sin contraseña usando clave criptográfica.",
    state: "Activo",
    accent: "violet",
    icon: "passkey",
    active: true,
    recommended: true
  },
  {
    id: "passphrase",
    title: "Passphrase",
    description: "Frase secreta larga y memorable como método de acceso.",
    state: "Disponible",
    accent: "yellow",
    icon: "phrase",
    recommended: true
  }
];

export const defaultCombination = ["passkeys", "pin", "2fa"];

export const protectionOptions: ProtectionOption[] = [
  { id: "strong-passwords", title: "Contraseñas fuertes", icon: "lock", type: "toggle", enabled: true },
  { id: "unique-passwords", title: "Contraseñas únicas", icon: "pin", type: "toggle", enabled: true },
  { id: "password-manager", title: "Gestor de contraseñas", icon: "shield", type: "action", enabled: false },
  { id: "two-step", title: "Verificación en dos pasos", icon: "shield", type: "toggle", enabled: true },
  { id: "security-keys", title: "Llaves de seguridad", icon: "key", type: "action", enabled: false },
  { id: "passkeys", title: "Passkeys", icon: "passkey", type: "toggle", enabled: true },
  { id: "authenticator", title: "Aplicación autenticadora", icon: "mobile", type: "toggle", enabled: true },
  { id: "recovery-codes", title: "Códigos de recuperación", icon: "shield", type: "action", enabled: false },
  { id: "login-alerts", title: "Alertas de inicio de sesión", icon: "bell", type: "toggle", enabled: true },
  { id: "device-review", title: "Revisión de dispositivos", icon: "desktop", type: "action", enabled: false },
  { id: "unknown-sessions", title: "Cierre de sesiones desconocidas", icon: "desktop", type: "toggle", enabled: true },
  { id: "primary-email", title: "Protección del correo principal", icon: "mail", type: "toggle", enabled: true },
  { id: "system-updates", title: "Actualizaciones del sistema", icon: "refresh", type: "toggle", enabled: true },
  { id: "screen-lock", title: "Bloqueo de pantalla", icon: "lock", type: "action", enabled: false },
  { id: "sim-swapping", title: "Protección contra SIM swapping", icon: "shield", type: "toggle", enabled: true },
  { id: "connected-apps", title: "Revisión de apps conectadas", icon: "grid", type: "action", enabled: false },
  { id: "anti-phishing", title: "Anti-phishing", icon: "shield", type: "toggle", enabled: true },
  { id: "vpn", title: "VPN", icon: "globe", type: "toggle", enabled: false },
  { id: "mail-separation", title: "Separación de correos", icon: "mail", type: "action", enabled: false },
  { id: "breach-monitoring", title: "Monitoreo de filtraciones", icon: "eye", type: "toggle", enabled: true }
];

export const securityProfiles: SecurityProfile[] = [
  {
    id: "basic",
    title: "Básico",
    description: "PIN + contraseña y alertas activas.",
    methods: ["password", "pin"],
    protections: ["strong-passwords", "login-alerts", "screen-lock"]
  },
  {
    id: "reinforced",
    title: "Reforzado",
    description: "Passkey + PIN + 2FA para la mayoría de equipos.",
    methods: ["passkeys", "pin", "2fa"],
    protections: ["two-step", "breach-monitoring", "device-review", "anti-phishing"]
  },
  {
    id: "maximum",
    title: "Máxima seguridad",
    description: "Passphrase + YubiKey + 2FA con controles adicionales.",
    methods: ["passphrase", "yubikey", "2fa"],
    protections: ["security-keys", "unknown-sessions", "vpn", "sim-swapping", "breach-monitoring"]
  }
];

export const otherDevices: DeviceSession[] = [
  {
    id: "windows-laptop",
    name: "Windows Laptop",
    client: "Chrome 124.0.6367.61 · Windows 11",
    location: "Monterrey, MX",
    ip: "192.168.1.88",
    timestamp: "Activa ahora",
    state: "Activa ahora",
    icon: "laptop",
    trusted: true
  },
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    client: "DigiPET Mobile 2.1.0 · iOS 17.4",
    location: "Guadalajara, MX",
    ip: "189.203.45.67",
    timestamp: "28 abr. 2026, 04:21 p. m.",
    state: "Sospechosa",
    icon: "mobile"
  },
  {
    id: "macbook-air-m2",
    name: "MacBook Air M2",
    client: "Safari 17.3 · macOS 14.4",
    location: "Ciudad de México, MX",
    ip: "201.141.22.15",
    timestamp: "27 abr. 2026, 09:10 a. m.",
    state: "Reciente",
    icon: "laptop"
  }
];

export const accessHistory: AccessEntry[] = [
  {
    id: "access-1",
    location: "Monterrey, MX",
    ip: "192.168.1.72",
    device: "Windows Desktop",
    timestamp: "29 abr. 2026, 11:44 p. m.",
    severity: "OK"
  },
  {
    id: "access-2",
    location: "Monterrey, MX",
    ip: "192.168.1.72",
    device: "Windows Desktop",
    timestamp: "29 abr. 2026, 11:40 p. m.",
    severity: "OK"
  },
  {
    id: "access-3",
    location: "Guadalajara, MX",
    ip: "189.203.45.67",
    device: "iPhone 15 Pro",
    timestamp: "28 abr. 2026, 04:21 p. m.",
    severity: "Warning"
  },
  {
    id: "access-4",
    location: "Ciudad de México, MX",
    ip: "201.141.22.15",
    device: "MacBook Air M2",
    timestamp: "27 abr. 2026, 09:10 a. m.",
    severity: "OK"
  }
];

export const securityControls: SecurityControlItem[] = [
  { id: "screen-lock", title: "Bloqueo de pantalla", description: "Bloquea la app después de 5 min de inactividad.", state: "Activado", accent: "green", icon: "lock" },
  { id: "login-alerts", title: "Alertas de inicio de sesión", description: "Recibe notificaciones de nuevos inicios de sesión.", state: "Activado", accent: "green", icon: "bell" },
  { id: "device-review", title: "Revisión de dispositivos conectados", description: "Revisa y gestiona los dispositivos con acceso.", state: "Gestionar", accent: "blue", icon: "desktop" },
  { id: "breach-monitoring", title: "Monitoreo de filtraciones", description: "Recibe alertas si tus datos aparecen expuestos.", state: "Activado", accent: "green", icon: "eye" },
  { id: "anti-phishing", title: "Anti-phishing", description: "Protección contra sitios y correos maliciosos.", state: "Activado", accent: "green", icon: "shield" },
  { id: "vpn", title: "VPN", description: "Cifra tu conexión y protege tu privacidad.", state: "No configurada", accent: "yellow", icon: "globe" },
  { id: "primary-email", title: "Protección del correo principal", description: "Verifica y protege la seguridad de tu correo.", state: "Activado", accent: "green", icon: "mail" },
  { id: "system-updates", title: "Actualizaciones del sistema", description: "Recomendamos mantener tu sistema actualizado.", state: "Activado", accent: "green", icon: "refresh" }
];

export function buildCurrentSession(session: SessionSnapshot | null) {
  return {
    startedAt: session?.unlockedAt ? formatSessionDate(session.unlockedAt) : "29 abr. 2026, 11:44 p. m.",
    device: "Windows Desktop",
    ip: "192.168.1.72",
    location: "Monterrey, MX",
    mac: "A4:6B:91:2C:7E:11",
    method: session?.method ?? "pin"
  };
}

export function buildDashboardActivities(hydrated: HydratedAppState): DashboardActivityItem[] {
  const base: DashboardActivityItem[] = hydrated.events.slice(0, 4).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    timestamp: formatSessionDate(event.timestamp),
    severity: event.severity
  }));

  if (base.length >= 4) return base;

  return [
    ...base,
    {
      id: "modules-active",
      title: "Módulos activos",
      description: "Cámara, auditoría y monitoreo activos.",
      timestamp: "29 abr. 2026, 11:30 p. m.",
      severity: "success" as const
    }
  ].slice(0, 4) as DashboardActivityItem[];
}

export function derivePosture(activeProtectionIds: string[], alertCount: number, riskScore: number) {
  const activeCount = activeProtectionIds.length;
  const total = protectionOptions.length;
  const score = Math.max(0, Math.min(100, Math.round((activeCount / total) * 100 - alertCount * 2 + (100 - riskScore) * 0.25)));
  const label = score >= 85 ? "Buen estado" : score >= 70 ? "Reforzar" : "Riesgo elevado";
  return {
    score,
    label,
    activeCount,
    total
  };
}

function formatSessionDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
