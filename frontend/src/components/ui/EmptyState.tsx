import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

// Per the design brief: an empty screen is an invitation to act, not a
// dead end. Every usage should say plainly what's missing and offer the
// one action that fixes it.
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-50 shadow-sm">
        <Icon className="h-6 w-6 text-brass-400" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-medium text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
