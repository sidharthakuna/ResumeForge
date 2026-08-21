import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

export function SectionHeader({
  title,
  description,
  action,
  icon: Icon,
  colorTone = 'amber',
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: LucideIcon
  colorTone?: 'amber' | 'indigo' | 'emerald' | 'purple' | 'cyan' | 'rose' | 'blue' | 'teal'
}) {
  const badgeStyles = {
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    indigo: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    rose: 'bg-rose-100 text-rose-800 border border-rose-300 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300',
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    teal: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  }

  return (
    <div className="mb-4 sm:mb-6 flex flex-wrap items-start justify-between gap-2.5">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {Icon && (
          <div className={clsx('flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl', badgeStyles[colorTone])}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.9} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-lg sm:text-xl font-bold text-ink-900 truncate">{title}</h1>
          {description && <p className="mt-0.5 text-xs sm:text-sm text-ink-600 dark:text-ink-400 font-medium leading-relaxed">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
