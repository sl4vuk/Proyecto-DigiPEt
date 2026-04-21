import { useEffect } from "react";
import { useSecurityStore } from "@/store/security-store";

export function useAppBootstrap() {
  const loadBootstrap = useSecurityStore((state) => state.loadBootstrap);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);
}
