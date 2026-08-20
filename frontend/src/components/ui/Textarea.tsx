import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          'w-full min-h-24 rounded-xl border bg-paper-50 px-4 py-3 text-base sm:text-sm text-ink-900 shadow-sm placeholder:text-ink-400',
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
Textarea.displayName = 'Textarea'
