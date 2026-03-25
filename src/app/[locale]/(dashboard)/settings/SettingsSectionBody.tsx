"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared shell: border, background, horizontal padding for every settings tab panel. */
export const settingsSectionSurfaceClassName =
  "rounded-xl border border-dashed border-border bg-background p-4 md:p-6";

/**
 * Inner column: titles and content share the same left/right bounds and match the tab-strip-centered shell.
 */
export const settingsSectionBodyClassName = "w-full max-w-6xl lg:mx-auto";

type SettingsSectionBodyProps = {
  children: ReactNode;
  /** Vertical gap between direct children (title block, main content, etc.) */
  gap?: "default" | "compact";
  className?: string;
};

export function SettingsSectionBody({
  children,
  gap = "default",
  className,
}: SettingsSectionBodyProps) {
  return (
    <div
      className={cn(
        settingsSectionBodyClassName,
        gap === "default" ? "space-y-6" : "space-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}
