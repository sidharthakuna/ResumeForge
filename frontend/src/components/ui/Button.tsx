import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brass-500 text-white shadow-sm hover:bg-brass-400 hover:shadow-md active:bg-brass-600 disabled:bg-ink-200 disabled:text-ink-400 disabled:shadow-none',
  secondary:
    'bg-ink-50 text-ink-900 shadow-sm hover:bg-ink-100 active:bg-ink-200 disabled:bg-ink-50 disabled:text-ink-300 font-medium',
  outline:
    'bg-paper-50 text-ink-900 border border-ink-100 shadow-sm hover:bg-ink-50 active:bg-ink-100 disabled:text-ink-300 disabled:border-ink-100',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-50 active:bg-ink-100 disabled:text-ink-300',
  danger: 'bg-danger-500 text-white shadow-sm hover:bg-danger-600 active:bg-danger-700 disabled:opacity-50',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-9 w-9 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 ease-[var(--ease-standard)] disabled:cursor-not-allowed',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-400',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
