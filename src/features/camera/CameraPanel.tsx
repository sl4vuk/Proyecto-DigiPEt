import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ScanFace, ShieldAlert, VideoOff } from "lucide-react";
import { ActionButton } from "@/components/security/ActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { checkCameraAvailability, requestCameraStream, stopCameraStream } from "@/services/camera-service";
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
      pushToast({ title: "No se pudo abrir la webcam", description, variant: "critical" });
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
        description: "Se generó un incidente manual desde el módulo de cámara.",
        severity: "warning",
        detectedGesture: "test",
        suspectedIntrusion: true
      });
      pushToast({ title: "Evento registrado", description: "Se agregó al historial local.", variant: "success" });
    } finally {
      setArming(false);
    }
  }

  const status = useMemo(() => (!enabled ? "Apagado" : !available ? "Sin webcam" : stream ? "Activa" : "Lista"), [available, enabled, stream]);

  if (!enabled) return <EmptyState icon={Camera} title="Cámara desactivada" description="Actívala en Ajustes cuando la necesites." />;
  if (!available) return <EmptyState icon={VideoOff} title="Sin webcam disponible" description={availability} />;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="overflow-hidden rounded-[28px] bg-[var(--surface)]">
        {stream ? (
          <video ref={videoRef} autoPlay muted playsInline className="aspect-video h-full w-full object-cover" />
        ) : (
          <div className="grid aspect-video place-items-center text-sm text-[var(--text-soft)]">Preview inactiva</div>
        )}
      </div>
      <div className="space-y-4">
        <div className="rounded-[24px] bg-[var(--surface)] px-4 py-4 text-sm text-[var(--text-soft)]">Estado: <span className="text-[var(--text)]">{status}</span></div>
        <div className="grid gap-3">
          <ActionButton icon={Camera} onClick={() => void startPreview()}>Iniciar preview</ActionButton>
          <ActionButton emphasis="subtle" icon={ScanFace} onClick={() => pushToast({ title: "Detección", description: "Modo de prueba listo.", variant: "info" })}>Probar detección</ActionButton>
          <ActionButton emphasis="subtle" icon={ShieldAlert} onClick={() => void simulateAlert()} disabled={arming}>{arming ? "Registrando..." : "Calibrar"}</ActionButton>
          {stream ? <ActionButton emphasis="subtle" onClick={() => void stopPreview()}>Detener</ActionButton> : null}
        </div>
      </div>
    </div>
  );
}
