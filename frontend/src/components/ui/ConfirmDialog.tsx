import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = true,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-ink-100 bg-paper-50 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3">
          {destructive && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-500/15 text-danger-500 dark:text-danger-400">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          )}
          <div>
            <h2 id="confirm-dialog-title" className="font-display text-base font-semibold text-ink-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-ink-500">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
