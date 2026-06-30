import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Vibration } from "react-native";

export const DEFAULT_REST_SECONDS = 90;

/**
 * A between-sets rest countdown. Idle until `start()`; ticks down once a
 * second and buzzes when it reaches zero. The user can add/subtract time or
 * skip it entirely. Purely in-memory — not persisted.
 */
export function useRestTimer(defaultSeconds: number = DEFAULT_REST_SECONDS) {
  // null = no rest running.
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clear();
    setRemaining(null);
  }, [clear]);

  const start = useCallback(
    (seconds: number = defaultSeconds) => {
      clear();
      setRemaining(Math.max(1, Math.round(seconds)));
    },
    [clear, defaultSeconds],
  );

  const addTime = useCallback((delta: number) => {
    setRemaining((r) => (r == null ? r : Math.max(1, r + delta)));
  }, []);

  // Drive the countdown while a rest is active.
  useEffect(() => {
    if (remaining == null) return;
    clear();
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r == null) return r;
        if (r <= 1) {
          clear();
          if (Platform.OS !== "web") Vibration.vibrate(400);
          return null;
        }
        return r - 1;
      });
    }, 1000);
    return clear;
    // Only re-arm the interval when transitioning idle<->active, not on each tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining == null]);

  useEffect(() => clear, [clear]);

  return {
    /** Seconds left, or null when no rest is running. */
    remaining,
    active: remaining != null,
    start,
    stop,
    addTime,
  };
}
