import { Camera } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { CameraPanel } from "@/features/camera/CameraPanel";
import { useI18n } from "@/i18n";

export function CameraPage() {
  const t = useI18n();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t.pages.cameraEyebrow}
        title={t.pages.cameraTitle}
        description={t.pages.cameraDescription}
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
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--field)] p-4 shadow-[var(--shadow-soft)]">
      <div className="grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--text)]">
        <Camera aria-hidden="true" className="h-4 w-4" />
      </div>
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">{description}</p>
    </div>
  );
}
