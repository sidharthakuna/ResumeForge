import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-500">
      <Loader2 className={clsx('h-5 w-5 animate-spin', className)} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}

export function FullPageSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[40vh] w-full items-center justify-center">
      <Spinner label={label} />
    </div>
  )
}
