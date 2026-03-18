"use client";

import { useState, useCallback, useEffect } from "react";
import {
  OPTIONAL_APP_IDS,
  ESSENTIAL_APP_IDS,
  type AppConfig,
} from "@/config/apps";

const STORAGE_KEY = "core_enabled_apps";

function loadEnabledOptionalApps(): Set<string> {
  if (typeof window === "undefined") return new Set(OPTIONAL_APP_IDS);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set(OPTIONAL_APP_IDS);
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return new Set(OPTIONAL_APP_IDS);
    return new Set(parsed.filter((id) => OPTIONAL_APP_IDS.includes(id as any)));
  } catch {
    return new Set(OPTIONAL_APP_IDS);
  }
}

function saveEnabledOptionalApps(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function useEnabledApps() {
  const [enabledOptional, setEnabledOptional] = useState<Set<string>>(() =>
    loadEnabledOptionalApps()
  );

  useEffect(() => {
    const stored = loadEnabledOptionalApps();
    setEnabledOptional(stored);
  }, []);

  const isEnabled = useCallback(
    (appId: string): boolean => {
      if (ESSENTIAL_APP_IDS.includes(appId as any)) return true;
      return enabledOptional.has(appId);
    },
    [enabledOptional]
  );

  const toggleApp = useCallback((appId: string) => {
    if (ESSENTIAL_APP_IDS.includes(appId as any)) return;
    setEnabledOptional((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      saveEnabledOptionalApps(next);
      return next;
    });
  }, []);

  const enabledAppIds = useCallback(() => {
    const ids = new Set<string>([...ESSENTIAL_APP_IDS, ...enabledOptional]);
    return ids;
  }, [enabledOptional]);

  return {
    enabledAppIds: enabledAppIds(),
    isEnabled,
    toggleApp,
    enabledOptional,
  };
}
