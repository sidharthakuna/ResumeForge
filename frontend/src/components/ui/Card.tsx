import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-xl sm:rounded-2xl border border-slate-400/80 bg-paper-50 shadow-xs dark:border-ink-200 overflow-hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('flex items-center justify-between gap-2.5 border-b border-slate-400/80 dark:border-ink-200 px-3.5 py-3 sm:px-5 sm:py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('p-3.5 sm:p-5', className)} {...props}>
      {children}
    </div>
  )
}

