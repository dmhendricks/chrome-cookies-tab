import type { Toast } from '../hooks/useToasts';

interface Props {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export function Toasts({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.severity}`}
          style={{ '--toast-duration': `${t.durationMs}ms` }}
          onClick={() => onDismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
