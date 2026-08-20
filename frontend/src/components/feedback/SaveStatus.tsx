import { Check, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

type Status = 'idle' | 'saving' | 'saved'

export function SaveStatus({ status, className }: { status: Status; className?: string }) {
  if (status === 'idle') return null
  return (
    <span className={clsx('flex items-center gap-1.5 text-xs text-ink-400', className)}>
      {status === 'saving' ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" /> Saving…
        </>
      ) : (
        <>
          <Check className="h-3 w-3 text-success-600" /> Saved
        </>
      )}
    </span>
  )
}
