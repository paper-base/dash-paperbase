"use client";

import { useEffect } from "react";
import {
  applyThemePreference,
  CORE_THEME_STORAGE_KEY,
  getStoredThemePreference,
  persistThemePreference,
  subscribeToSystemThemeChanges,
  type ThemePreference,
} from "@/lib/theme";

function getInitialPreference(): ThemePreference {
  const stored = getStoredThemePreference();
  return stored ?? "system";
}

/**
 * Keeps root `dark` class + cookies aligned with the user's theme preference.
 * Also listens for OS color-scheme changes whenever preference is "system"
 * (re-reads storage on each event so this works on routes without Sidebar, e.g. checkout).
 */
export function ThemeSync() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pref = getInitialPreference();
    persistThemePreference(pref);
    applyThemePreference(pref);

    /** Apply only if the user is following the system — read fresh so we never use a stale preference. */
    const onSystemSchemeChange = () => {
      const current = getStoredThemePreference() ?? "system";
      if (current === "system") {
        applyThemePreference("system");
      }
    };

    const cleanupMedia = subscribeToSystemThemeChanges(onSystemSchemeChange);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== CORE_THEME_STORAGE_KEY) return;
      const next =
        event.newValue === "light" || event.newValue === "dark" || event.newValue === "system"
          ? (event.newValue as ThemePreference)
          : "system";
      applyThemePreference(next);
    };

    window.addEventListener("storage", onStorage);
    return () => {
      cleanupMedia();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
