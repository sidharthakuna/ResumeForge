import type { ReactNode } from 'react'
import { FileText, ShieldCheck, Sparkles } from 'lucide-react'

export function LoginShell({
  children,
  title = 'Welcome Back',
  subtitle = 'Sign in to access your resumes and career assets',
}: {
  children: ReactNode
  title?: string
  subtitle?: string
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 sm:py-12 dark:bg-slate-950">

      <div className="relative w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <FileText className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            ResumeForge
          </span>
          <h1 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-500 dark:text-slate-400 max-w-xs">{subtitle}</p>
        </div>

        {/* High-Precision Auth Card */}
        <div className="relative rounded-2xl border border-ink-200/80 bg-paper-50 p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
          {children}
        </div>

        {/* Security & Trust Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium text-ink-400 dark:text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>256-bit SSL Encrypted • 100% Privacy Protected</span>
        </div>
      </div>
    </div>
  )
}
