import { useEffect, useRef } from "react";

interface UseInactivityLockOptions {
  enabled: boolean;
  minutes: number;
  onLock: () => Promise<void> | void;
}

export function useInactivityLock({
  enabled,
  minutes,
  onLock
}: UseInactivityLockOptions) {
  const timeoutRef = useRef<number | null>(null);
  const lockingRef = useRef(false);

  useEffect(() => {
    if (!enabled || minutes <= 0) return undefined;

    const reset = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(async () => {
        if (lockingRef.current) return;
        lockingRef.current = true;
        try {
          await onLock();
        } finally {
          lockingRef.current = false;
        }
      }, minutes * 60_000);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart"
    ];

    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    document.addEventListener("visibilitychange", reset);
    reset();

    return () => {
      events.forEach((event) => window.removeEventListener(event, reset));
      document.removeEventListener("visibilitychange", reset);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, minutes, onLock]);
}
