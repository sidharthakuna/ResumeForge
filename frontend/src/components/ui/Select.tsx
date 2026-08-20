import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'h-11 w-full appearance-none rounded-lg border bg-paper-50 pl-4 pr-9 text-sm text-ink-900 shadow-sm',
            'transition-all duration-150 focus:outline-none focus:ring-4',
            invalid
              ? 'border-danger-500 focus:ring-danger-100'
              : 'border-ink-300 hover:border-ink-400 focus:border-brass-400 focus:ring-brass-100 dark:border-ink-100 dark:hover:border-ink-200',
            'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      </div>
    )
  },
)
Select.displayName = 'Select'
