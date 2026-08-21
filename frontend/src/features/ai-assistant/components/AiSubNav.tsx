import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Target,
  Zap,
  Wand2,
  Layers,
  Bot,
  Sparkles,
} from 'lucide-react'

interface AiSubNavProps {
  currentResumeId?: string
}

export function AiSubNav({ currentResumeId }: AiSubNavProps) {
  const location = useLocation()
  const qParam = currentResumeId ? `?resumeId=${currentResumeId}` : ''

  const navItems = [
    {
      label: 'AI Hub Overview',
      to: `/ai${qParam}`,
      path: '/ai',
      exact: true,
      icon: Bot,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'ATS Compatibility Audit',
      to: `/ai/ats${qParam}`,
      path: '/ai/ats',
      icon: Target,
      color: 'text-emerald-600 dark:text-emerald-400',
      badge: 'Audit',
    },
    {
      label: 'Job Description Matcher',
      to: `/ai/tailor${qParam}`,
      path: '/ai/tailor',
      icon: Zap,
      color: 'text-indigo-600 dark:text-indigo-400',
      badge: 'Match',
    },
    {
      label: 'AI Summary Studio',
      to: `/ai/summary${qParam}`,
      path: '/ai/summary',
      icon: Wand2,
      color: 'text-purple-600 dark:text-purple-400',
      badge: 'Studio',
    },
    {
      label: 'Skills Optimizer',
      to: `/ai/skills${qParam}`,
      path: '/ai/skills',
      icon: Layers,
      color: 'text-cyan-600 dark:text-cyan-400',
      badge: 'ATS Rank',
    },
  ]

  return (
    <div className="mb-4 sm:mb-6 flex w-full items-center justify-between overflow-x-auto rounded-2xl border border-ink-100 bg-paper-50/80 p-1 shadow-2xs backdrop-blur-md dark:border-ink-200 dark:bg-paper-50/70 scrollbar-none">
      <div className="flex items-center gap-1 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path)

          return (
            <Link
              key={item.path}
              to={item.to}
              className={clsx(
                'flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold transition-all whitespace-nowrap',
                isActive
                  ? 'bg-white text-ink-900 shadow-xs border border-ink-100 dark:bg-slate-900 dark:text-white dark:border-slate-800'
                  : 'text-ink-500 hover:bg-ink-100/50 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-100/20 dark:hover:text-white',
              )}
            >
              <Icon className={clsx('h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0', item.color)} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={clsx(
                  'hidden sm:inline rounded-md px-1.5 py-0.2 text-[9px] font-extrabold uppercase',
                  isActive
                    ? 'bg-ink-100 dark:bg-ink-200 text-ink-700 dark:text-ink-200'
                    : 'bg-ink-100/60 dark:bg-ink-200/40 text-ink-500',
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <div className="hidden lg:flex items-center gap-1.5 px-3 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Gemini AI</span>
      </div>
    </div>
  )
}

