export type ThemeMode = "dark" | "light" | "system";
export type Severity = "info" | "warning" | "critical" | "success";
export type RiskLabel = "low" | "moderate" | "high" | "critical";
export type IntegrityStatus = "verified" | "changed" | "missing";
export type EncryptionStatus = "sealed" | "unlocked" | "attention";
export type ProtectedItemKind = "file" | "directory";
export type ProtectionLevel = "standard" | "strict" | "isolation";
export type AuthMethod = "pin" | "camera";
export type CameraStatus = "ready" | "disabled" | "unavailable";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: Severity;
  durationMs?: number;
}

export interface BootstrapStatus {
  initialized: boolean;
  sessionLocked: boolean;
  secureStorageReady: boolean;
  failedAttempts: number;
  failedAttemptThreshold: number;
  lockReason?: string | null;
  lockedUntil?: string | null;
}

export interface SecuritySettings {
  theme: ThemeMode;
  autoLockMinutes: number;
  cameraModuleEnabled: boolean;
  failedAttemptThreshold: number;
  emergencyMode: boolean;
  locale: string;
  defaultRoots: string[];
}

export interface ProtectedItem {
  id: string;
  path: string;
  kind: ProtectedItemKind;
  sizeBytes: number;
  locked: boolean;
  protectionLevel: ProtectionLevel;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string | null;
  fingerprint: string;
  integrityStatus: IntegrityStatus;
  notes?: string | null;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  category: "auth" | "vault" | "camera" | "integrity" | "system";
  severity: Severity;
  title: string;
  description: string;
  path?: string | null;
  metadata?: Record<string, string>;
}

export interface SessionSnapshot {
  unlockedAt: string;
  method: AuthMethod;
}

export interface OverviewMetrics {
  protectedItems: number;
  lockedItems: number;
  alertCount: number;
  riskScore: number;
  riskLabel: RiskLabel;
  encryptionStatus: EncryptionStatus;
  lastScanAt?: string | null;
  recentActivity: number;
  cameraStatus: CameraStatus;
}

export interface HydratedAppState {
  overview: OverviewMetrics;
  items: ProtectedItem[];
  events: SecurityEvent[];
  settings: SecuritySettings;
  session: SessionSnapshot | null;
}

export interface SetupPinInput {
  pin: string;
  confirmPin: string;
}

export interface AddProtectedItemInput {
  path: string;
  kind: ProtectedItemKind;
  protectionLevel: ProtectionLevel;
  note?: string;
}

export interface UpdateSettingsInput {
  theme?: ThemeMode;
  autoLockMinutes?: number;
  cameraModuleEnabled?: boolean;
  failedAttemptThreshold?: number;
  emergencyMode?: boolean;
  locale?: string;
  defaultRoots?: string[];
}

export interface RotatePinInput {
  currentPin: string;
  nextPin: string;
  confirmPin: string;
}

export interface RegisterCameraEventInput {
  title: string;
  description: string;
  severity: Severity;
  detectedGesture?: string;
  suspectedIntrusion?: boolean;
}
