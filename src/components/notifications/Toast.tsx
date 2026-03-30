"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastProps = {
  variant: ToastVariant;
  message: string;
  title?: string;
  action?: ToastAction;
  onClose: () => void;
};

export function Toast({ variant, message, title, action, onClose }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto relative w-full overflow-hidden rounded-xl border border-zinc-900/10 dark:border-white/15",
        "bg-background text-foreground shadow-none",
        "p-4 transition-all duration-250 ease-out",
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-3 data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-2 data-[state=closed]:fade-out-0",
      )}
    >
      <div className="flex items-start gap-3 pr-7">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5 tracking-tight text-foreground">
            {title ?? "Notification"}
          </p>
          <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{message}</p>
          {action ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={action.onClick}
                className="rounded-md border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/80"
              >
                {action.label}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
