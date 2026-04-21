import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ScanFace, ShieldAlert, VideoOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  checkCameraAvailability,
  requestCameraStream,
  stopCameraStream
} from "@/services/camera-service";
import { useSecurityStore } from "@/store/security-store";
import { useUiStore } from "@/store/ui-store";

export function CameraPanel() {
  const hydrated = useSecurityStore((state) => state.hydrated);
  const registerCameraEvent = useSecurityStore((state) => state.registerCameraEvent);
  const pushToast = useUiStore((state) => state.pushToast);

  const enabled = hydrated?.settings.cameraModuleEnabled ?? false;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [availability, setAvailability] = useState<string>("Comprobando webcam...");
  const [available, setAvailable] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [arming, setArming] = useState(false);

  useEffect(() => {
    let mounted = true;
    void checkCameraAvailability().then((result) => {
      if (!mounted) return;
      setAvailable(result.available);
      setAvailability(result.label);
    });

    return () => {
      mounted = false;
      stopCameraStream(stream);
    };
  }, [stream]);

  useEffect(() => {
    if (!videoRef.current || !stream) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  async function startPreview() {
    try {
      const next = await requestCameraStream();
      setStream(next);
    } catch (error) {
      const description = error instanceof Error ? error.message : "No se pudo iniciar la webcam.";
      setAvailability(description);
      setAvailable(false);
      pushToast({
        title: "No se pudo abrir la webcam",
        description,
        variant: "critical"
      });
    }
  }

  async function stopPreview() {
    stopCameraStream(stream);
    setStream(null);
  }

  async function simulateAlert() {
    setArming(true);
    try {
      await registerCameraEvent({
        title: "Evento de vigilancia registrado",
        description:
          "Se generó un incidente manual desde el módulo de cámara para validar la tubería de respuesta.",
        severity: "warning",
        detectedGesture: calibrated ? "custom-calibrated" : "unrecognized",
        suspectedIntrusion: true
      });
      pushToast({
        title: "Incidente visual registrado",
        description: "El evento quedó incorporado al historial local.",
        variant: "success"
      });
    } catch (error) {
      pushToast({
        title: "No se pudo registrar el evento",
        description: error instanceof Error ? error.message : String(error),
        variant: "critical"
      });
    } finally {
      setArming(false);
    }
  }

  const statusBadge = useMemo(() => {
    if (!enabled) return <Badge variant="neutral">módulo apagado</Badge>;
    if (!available) return <Badge variant="warning">sin webcam</Badge>;
    if (!calibrated) return <Badge variant="info">listo para calibrar</Badge>;
    return <Badge variant="success">pipeline armado</Badge>;
  }, [available, calibrated, enabled]);

  if (!enabled) {
    return (
      <EmptyState
        icon={Camera}
        title="El módulo de cámara está desactivado"
        description="Actívalo en ajustes para habilitar pruebas locales, calibración y eventos listos para integrar MediaPipe o un motor biométrico real."
      />
    );
  }

  if (!available) {
    return (
      <EmptyState
        icon={VideoOff}
        title="No hay webcam disponible"
        description={availability}
      />
    );
  }

  return (
    <Card
      title="Cámara y gestos"
      description="Preview desacoplado del core seguro, con espacio de integración para biometría o gestos."
      actions={statusBadge}
    >
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden border border-[var(--border)] bg-[var(--field)]">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="aspect-video h-full w-full object-cover"
            />
          ) : (
            <div className="grid aspect-video place-items-center">
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
                  <Camera className="h-6 w-6" />
                </div>
                <p className="mt-4 font-medium">Vista previa detenida</p>
                <p className="mt-2 text-sm text-[var(--text-soft)]">
                  La webcam queda disponible bajo demanda.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="border border-[var(--border)] bg-[var(--field)] p-4">
            <p className="text-sm font-medium">Estado detectado</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{availability}</p>
          </div>

          <div className="border border-[var(--border)] bg-[var(--field)] p-4">
            <p className="text-sm font-medium">Fase de integración</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
              El panel ya resuelve acceso a webcam, estado, pruebas manuales y registro de
              incidentes. El próximo paso es conectar detección de rostro, manos o gestos sobre
              este contenedor visual.
            </p>
          </div>

          <div className="grid gap-3">
            <Button variant="primary" icon={Camera} onClick={() => void startPreview()}>
              Iniciar preview
            </Button>
            <Button variant="secondary" icon={ScanFace} onClick={() => setCalibrated(true)}>
              Calibrar perfil visual
            </Button>
            <Button
              variant="secondary"
              icon={ShieldAlert}
              onClick={() => void simulateAlert()}
              disabled={arming}
            >
              {arming ? "Registrando..." : "Simular incidente"}
            </Button>
            <Button variant="ghost" onClick={() => void stopPreview()}>
              Detener preview
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
