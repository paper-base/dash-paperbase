"use client";

import { useCallback, useEffect, useState } from "react";

import { getActiveSystemNotification } from "@/lib/api/systemNotification";
import type { SystemNotification } from "@/lib/api/systemNotification";

export function useSystemNotification() {
  const [notification, setNotification] = useState<SystemNotification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const n = await getActiveSystemNotification();
      setNotification(n);
    } catch {
      setNotification(null);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { notification, isLoading, isError, refetch };
}
