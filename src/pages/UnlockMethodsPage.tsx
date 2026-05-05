import { useState } from "react";
import { MethodCard } from "@/components/security/MethodCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { unlockMethods } from "@/features/security/mock-data";

export function UnlockMethodsPage() {
  const [selectedMethod, setSelectedMethod] = useState(unlockMethods[0]?.id ?? "password");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ajustes"
        title="Métodos de desbloqueo"
        description="Combina varios métodos de acceso y endurecimiento para proteger tu cuenta y dispositivos."
      />

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {unlockMethods.map((method) => (
          <MethodCard
            key={method.id}
            method={method}
            selected={selectedMethod === method.id}
            onClick={() => setSelectedMethod(method.id)}
          />
        ))}
      </div>
    </div>
  );
}
