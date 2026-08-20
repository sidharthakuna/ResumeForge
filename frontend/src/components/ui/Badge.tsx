import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Tone = 'neutral' | 'success' | 'warn' | 'danger' | 'brass' | 'indigo' | 'amber' | 'emerald' | 'purple' | 'cyan' | 'rose' | 'blue' | 'teal'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-600',
  success: 'bg-cyan-100 text-cyan-700',
  warn: 'bg-warn-100 text-warn-600',
  danger: 'bg-danger-100 text-danger-600',
  brass: 'bg-brass-100 text-brass-700',
  indigo: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-medium',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium',
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium',
  purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 font-medium',
  cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-medium',
  rose: 'bg-rose-100 text-rose-800 border border-rose-300 dark:border-rose-800/40 dark:bg-rose-950/50 dark:text-rose-300 font-semibold',
  blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium',
  teal: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 font-medium',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
