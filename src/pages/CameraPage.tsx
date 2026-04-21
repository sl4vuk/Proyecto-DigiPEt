import { Camera } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { CameraPanel } from "@/features/camera/CameraPanel";

export function CameraPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="vision module"
        title="Módulo de cámara y biometría/gestos"
        description="Componente desacoplado del núcleo de seguridad, preparado para calibración, pruebas y futura inferencia visual."
      />

      <CameraPanel />

      <Card
        title="Hoja de ruta técnica"
        description="Puntos sugeridos para elevar este módulo a producción completa."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <RoadmapStep
            title="Detección"
            description="Integrar MediaPipe Tasks, OpenCV o un pipeline propio en worker/webview."
          />
          <RoadmapStep
            title="Calibración"
            description="Persistir embeddings o plantillas locales cifradas dentro del contenedor seguro."
          />
          <RoadmapStep
            title="Respuesta"
            description="Conectar señales visuales con reglas de intrusión, bloqueo automático y notificación."
          />
        </div>
      </Card>
    </div>
  );
}

interface RoadmapStepProps {
  title: string;
  description: string;
}

function RoadmapStep({ title, description }: RoadmapStepProps) {
  return (
    <div className="border border-[var(--border)] bg-[var(--field)] p-4">
      <div className="grid h-10 w-10 place-items-center border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
        <Camera className="h-4 w-4" />
      </div>
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
    </div>
  );
}
