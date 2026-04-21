import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Home}
      title="Vista no encontrada"
      description="La ruta solicitada no existe dentro de la consola segura."
      action={
        <Link to="/">
          <Button>Volver al dashboard</Button>
        </Link>
      }
    />
  );
}
