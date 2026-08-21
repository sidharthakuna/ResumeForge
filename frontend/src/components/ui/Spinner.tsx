import { Loader2, FileText, Sparkles } from 'lucide-react'
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

export function MobileEditorSkeleton() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-paper-100 lg:hidden animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex h-13 shrink-0 items-center justify-between border-b border-ink-100 bg-paper-50 px-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-18 rounded-xl" />
        </div>
      </div>

      {/* Stepper Bar Skeleton */}
      <div className="flex items-center justify-between border-b border-ink-100 bg-paper-50 px-3 py-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <Skeleton className="h-7 w-32 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>

      {/* Editor Body Form Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-2xl border border-ink-100 bg-paper-50 p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CreatingResumeOverlay({
  label = 'Creating your resume...',
  sublabel = 'Setting up your customized editor workspace',
}: {
  label?: string
  sublabel?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-ink-200/90 bg-paper-50 p-6 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-xs dark:border-indigo-900/50 dark:bg-indigo-950/60">
          <FileText className="h-7 w-7 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        <h3 className="text-base font-bold tracking-tight text-ink-900 dark:text-slate-100">{label}</h3>
        <p className="mt-1 text-xs text-ink-500 dark:text-slate-400">{sublabel}</p>

        <div className="mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-ink-100 dark:bg-slate-800">
          <div className="h-full w-1/2 rounded-full bg-indigo-600 animate-[loading-bar_1.2s_ease-in-out_infinite] dark:bg-indigo-500" />
        </div>
      </div>
    </div>
  )
}
