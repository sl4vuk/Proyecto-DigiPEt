import { useEffect, useState } from "react";
import * as api from "@/services/security-api";
import type { SystemInfoPayload } from "@/types/security";

const fallback: SystemInfoPayload = {
  hostname: "No disponible",
  username: "No disponible",
  osName: "No disponible",
  osVersion: "No disponible",
  deviceName: "No disponible",
  localIp: "No disponible",
  macAddresses: ["No disponible"],
  location: "Local",
};

export function useSystemInfo() {
  const [data, setData] = useState<SystemInfoPayload>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void api
      .getSystemInfo()
      .then((payload) => {
        if (!mounted) return;
        setData({
          ...payload,
          location: payload.location ?? "Local",
          localIp: payload.localIp ?? "No disponible",
          macAddresses: payload.macAddresses.length ? payload.macAddresses : ["No disponible"],
        });
      })
      .catch(() => {
        if (!mounted) return;
        setData(fallback);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { systemInfo: data, loading };
}
