import { clsx } from 'clsx'

/**
 * ResumeForge brand mark: vibrant rounded gradient tile with a modern geometric "R" emblem.
 */
export function Logo({
  size = 'md',
  wordmark = true,
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  wordmark?: boolean
  className?: string
}) {
  const dims = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-11 w-11' }[size]
  const textSize = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' }[size]

  return (
    <div className={clsx('group flex items-center gap-2.5 select-none', className)}>
      {/* Solid Indigo R Tile */}
      <div
        className={clsx(
          'relative flex shrink-0 items-center justify-center rounded-xl overflow-hidden',
          'bg-indigo-600',
          'text-white shadow-xs',
          'transition-all duration-200 group-hover:scale-105',
          dims,
        )}
      >

        <svg viewBox="0 0 24 24" className="relative z-10 h-[60%] w-[60%]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bold geometric "R" stem & loop */}
          <path
            d="M7 4.25C7 3.55964 7.55964 3 8.25 3H13.25C15.8734 3 18 5.12665 18 7.75C18 10.3734 15.8734 12.5 13.25 12.5H10.5V19.75C10.5 20.4404 9.94036 21 9.25 21H8.25C7.55964 21 7 20.4404 7 19.75V4.25Z"
            fill="white"
          />
          {/* Sweeping leg */}
          <path
            d="M12.5 12.25L17.75 19.75"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner cutout detail */}
          <path
            d="M10.5 6.5H13C13.6904 6.5 14.25 7.05964 14.25 7.75C14.25 8.44036 13.6904 9 13 9H10.5V6.5Z"
            fill="#6366F1"
          />
        </svg>
      </div>

      {wordmark && (
        <span className={clsx('font-display font-extrabold tracking-tight text-ink-900', textSize)}>
          Resume<span className="text-brass-500">Forge</span>
        </span>
      )}
    </div>
  )
}
