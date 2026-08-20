import type { LabelHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={clsx('mb-1.5 block pl-0.5 text-sm font-medium text-ink-600', className)} {...props}>
      {children}
    </label>
  )
}
