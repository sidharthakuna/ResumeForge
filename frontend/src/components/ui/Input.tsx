import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'h-11 w-full rounded-xl border bg-paper-50 px-4 text-base sm:text-sm text-ink-900 shadow-sm placeholder:text-ink-400',
          'transition-all duration-150 focus:outline-none focus:ring-4',
          invalid
            ? 'border-danger-500 focus:ring-danger-100'
            : 'border-ink-300 hover:border-ink-400 focus:border-brass-400 focus:ring-brass-100 dark:border-ink-100 dark:hover:border-ink-200',
          'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
