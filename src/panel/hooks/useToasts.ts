import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

export type ToastSeverity = 'info' | 'success' | 'warn' | 'help' | 'danger';

export interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
  durationMs: number;
}

const DEFAULT_TOAST_DURATION_MS = 4000;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      severity: ToastSeverity = 'info',
      durationMs: number = DEFAULT_TOAST_DURATION_MS,
    ) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, severity, durationMs }]);
      const handle = window.setTimeout(() => dismissToast(id), durationMs);
      timers.current.push(handle);
    },
    [dismissToast],
  );

  useEffect(() => {
    return () => {
      for (const h of timers.current) window.clearTimeout(h);
    };
  }, []);

  return { toasts, showToast, dismissToast };
}
