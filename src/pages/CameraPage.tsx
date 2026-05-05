import { CameraPanel } from "@/features/camera/CameraPanel";
import { PageHeader } from "@/components/ui/PageHeader";

export function CameraPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Cámara" title="Cámara y vigilancia" description="Preview y detección básica." />
      <CameraPanel />
    </div>
  );
}
