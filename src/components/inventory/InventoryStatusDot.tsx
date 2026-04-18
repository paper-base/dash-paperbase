"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { InventoryStatusLevel } from "@/lib/inventory-status";

export type { InventoryStatusLevel };

/**
 * Sidebar inventory health indicator. Outer box keeps width so layout does not shift
 * when the dot toggles.
 */
function InventoryStatusDotInner({
  status,
  className,
}: {
  status: InventoryStatusLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center",
        className
      )}
      aria-hidden={status === "none"}
    >
      {status === "red" ? (
        <span className="relative inline-flex h-2 w-2 shrink-0 rounded-full bg-red-500">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-400/80" />
        </span>
      ) : status === "orange" ? (
        <span className="relative inline-flex h-2 w-2 shrink-0 rounded-full bg-amber-500">
          <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/80" />
        </span>
      ) : (
        <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-transparent" />
      )}
    </span>
  );
}

export const InventoryStatusDot = memo(InventoryStatusDotInner);
