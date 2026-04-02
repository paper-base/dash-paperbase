"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "danger" | "default";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  isConfirmLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isConfirmLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const busy = isConfirmLoading;
  const hasTitle = Boolean(title);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(100%,calc(100vw-2rem))] max-w-[420px] gap-0 rounded-none border border-border/80 bg-background p-0 shadow-lg sm:max-w-md"
        onPointerDownOutside={(e) => {
          if (busy) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault();
        }}
      >
        <div className="flex flex-col gap-2.5 px-6 pt-6">
          {hasTitle ? (
            <DialogTitle className="m-0 p-0 text-left text-lg font-semibold leading-snug tracking-tight text-foreground">
              {title}
            </DialogTitle>
          ) : (
            <DialogTitle className="sr-only">{confirmText}</DialogTitle>
          )}
          <DialogDescription asChild>
            <div
              className={cn(
                "text-left leading-relaxed text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold",
                hasTitle ? "text-base" : "text-lg font-medium",
              )}
            >
              {message}
            </div>
          </DialogDescription>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-end gap-2 px-6 pb-6 pt-5">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onCancel}
            className={cn(
              "h-10 rounded-none px-3 text-base font-normal text-muted-foreground shadow-none",
              "hover:bg-muted/50 hover:text-foreground",
              "focus-visible:ring-1 focus-visible:ring-ring",
            )}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "destructive" : "default"}
            disabled={busy}
            aria-busy={busy}
            onClick={onConfirm}
            className="h-10 rounded-none px-4 text-base font-medium shadow-none"
          >
            {busy ? (
              <>
                <Spinner className="text-current" />
                <span>{confirmText}</span>
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
