"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  ConfirmDialog,
  type ConfirmDialogVariant,
} from "@/components/ui/ConfirmDialog";

export type ConfirmDialogOptions = {
  title?: ReactNode;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  onConfirm?: () => void | Promise<void>;
};

type QueueEntry = {
  options: ConfirmDialogOptions;
  resolve: (result: boolean) => void;
};

type ConfirmFn = (options: ConfirmDialogOptions) => Promise<boolean>;

const ConfirmDialogContext = createContext<ConfirmFn | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const queueRef = useRef<QueueEntry[]>([]);
  const openRef = useRef(false);
  const entryRef = useRef<QueueEntry | null>(null);

  const attachEntry = useCallback((next: QueueEntry | null) => {
    entryRef.current = next;
    setEntry(next);
  }, []);

  const showNext = useCallback(() => {
    const queued = queueRef.current.shift();
    if (queued) {
      openRef.current = true;
      attachEntry(queued);
    } else {
      openRef.current = false;
      attachEntry(null);
    }
  }, [attachEntry]);

  const flushCurrent = useCallback(
    (result: boolean) => {
      const current = entryRef.current;
      if (!current) return;
      current.resolve(result);
      setConfirmLoading(false);
      openRef.current = false;
      attachEntry(null);
      queueMicrotask(() => {
        const next = queueRef.current.shift();
        if (next) {
          openRef.current = true;
          attachEntry(next);
        }
      });
    },
    [attachEntry],
  );

  const confirm = useCallback(
    (options: ConfirmDialogOptions) =>
      new Promise<boolean>((resolve) => {
        const item: QueueEntry = { options, resolve };
        if (!openRef.current) {
          openRef.current = true;
          attachEntry(item);
        } else {
          queueRef.current.push(item);
        }
      }),
    [attachEntry],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) return;
      if (confirmLoading) return;
      if (entryRef.current) {
        flushCurrent(false);
      }
    },
    [confirmLoading, flushCurrent],
  );

  const handleCancel = useCallback(() => {
    if (confirmLoading) return;
    flushCurrent(false);
  }, [confirmLoading, flushCurrent]);

  const handleConfirm = useCallback(async () => {
    const current = entryRef.current;
    if (!current || confirmLoading) return;
    const { onConfirm } = current.options;
    if (!onConfirm) {
      flushCurrent(true);
      return;
    }
    setConfirmLoading(true);
    try {
      await onConfirm();
      flushCurrent(true);
    } catch {
      setConfirmLoading(false);
      current.resolve(false);
    }
  }, [confirmLoading, flushCurrent]);

  const ctx = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmDialogContext.Provider value={ctx}>
      {children}
      {entry ? (
        <ConfirmDialog
          open
          onOpenChange={handleOpenChange}
          title={entry.options.title}
          message={entry.options.message}
          confirmText={entry.options.confirmText}
          cancelText={entry.options.cancelText}
          variant={entry.options.variant ?? "default"}
          isConfirmLoading={confirmLoading}
          onCancel={handleCancel}
          onConfirm={() => void handleConfirm()}
        />
      ) : null}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmDialogContext);
  if (!fn) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider.");
  }
  return fn;
}
