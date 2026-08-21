import { Loader2, Sparkles, FileText } from 'lucide-react'
import { clsx } from 'clsx'

export function Spinner({
  className,
  size = 'md',
  label,
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  label?: string
}) {
  const sizeClasses = {
    sm: 'h-4 w-4 stroke-[2.5]',
    md: 'h-5 w-5 stroke-[2.5]',
    lg: 'h-7 w-7 stroke-[2.5]',
  }

  return (
    <div className="inline-flex items-center justify-center gap-2.5 text-indigo-600 dark:text-indigo-400">
      <Loader2 className={clsx('animate-spin', sizeClasses[size], className)} />
      {label && <span className="text-xs font-semibold tracking-wide text-ink-600 dark:text-slate-300">{label}</span>}
    </div>
  )
}

export function FullPageSpinner({
  label = 'Loading ResumeForge...',
  sublabel = 'Preparing your workspace',
}: {
  label?: string
  sublabel?: string
}) {
  return (
    <div className="flex min-h-[55vh] w-full flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
      {/* Brand Icon Mark */}
      <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-200/80 bg-paper-50 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-600" />
        </span>
      </div>

      {/* Primary & Secondary Label */}
      <h3 className="text-sm font-bold text-ink-900 tracking-tight dark:text-slate-100">{label}</h3>
      {sublabel && <p className="mt-1 text-xs text-ink-500 dark:text-slate-400 max-w-xs">{sublabel}</p>}

      {/* High-Precision Progress Bar */}
      <div className="mt-5 h-1 w-36 overflow-hidden rounded-full bg-ink-100 dark:bg-slate-800">
        <div className="h-full w-1/2 rounded-full bg-indigo-600 animate-[loading-bar_1.2s_ease-in-out_infinite] dark:bg-indigo-500" />
      </div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-ink-100/70 dark:bg-slate-800/80',
        className,
      )}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-container space-y-8 animate-in fade-in duration-200">
      {/* Hero skeleton */}
      <div className="rounded-2xl border border-ink-100 bg-paper-50 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
