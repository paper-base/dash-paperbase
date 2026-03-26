import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

export interface RateLimitInfo {
  action: string;
  retryAfter: number;
}

/**
 * Extract rate-limit cooldown info from a backend 429 response.
 * Returns `null` if the error is not a rate-limit response.
 */
export function extractRateLimitInfo(err: unknown): RateLimitInfo | null {
  if (!axios.isAxiosError(err)) return null;
  const { response } = err;
  if (response?.status !== 429) return null;
  const data = response.data as Record<string, unknown> | undefined;
  if (
    data &&
    data.error === "rate_limited" &&
    typeof data.retry_after === "number"
  ) {
    return {
      action: typeof data.action === "string" ? data.action : "",
      retryAfter: data.retry_after,
    };
  }
  return null;
}

/**
 * Manages a per-action countdown timer for rate-limit cooldowns.
 *
 * - No global state — resets on unmount (page nav, logout, store switch).
 * - Safe for concurrent use: multiple instances don't interfere.
 */
export function useRateLimitCooldown() {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(
    (seconds: number) => {
      clearTimer();
      const clamped = Math.max(0, Math.ceil(seconds));
      if (clamped === 0) return;
      setRemaining(clamped);
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer],
  );

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(0);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return {
    remaining,
    isLimited: remaining > 0,
    startCooldown,
    reset,
  } as const;
}
