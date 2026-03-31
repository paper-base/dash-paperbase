"use client";

import { useCallback, useState } from "react";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useMinDelayLoading(minDurationMs = 300) {
  const [loading, setLoading] = useState(false);

  const runWithLoading = useCallback(
    async <T,>(task: () => Promise<T>) => {
      const startedAt = Date.now();
      setLoading(true);
      try {
        return await task();
      } finally {
        const elapsed = Date.now() - startedAt;
        if (elapsed < minDurationMs) {
          await wait(minDurationMs - elapsed);
        }
        setLoading(false);
      }
    },
    [minDurationMs]
  );

  return { loading, runWithLoading };
}

