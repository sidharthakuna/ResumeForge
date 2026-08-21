import type { ReactNode } from 'react'
import { FileText, CheckCircle2, Zap } from 'lucide-react'

/**
 * Split-panel layout for Register: a dark marketing panel on the left
 * (hidden on small screens) and the form on the right, matching the
 * mockup's register_resumeforge screen. Distinct from LoginShell's
 * centered-card layout by design — the two mockup screens use genuinely
 * different shapes, not just different copy in the same frame.
 */
export function RegisterShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-950 p-10 text-paper-50 lg:flex xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '26px 26px',
          }}
        />
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brass-500/20 blur-3xl"
          aria-hidden
        />

        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-brass-500">
          <FileText className="h-5 w-5" strokeWidth={2} />
        </div>

        <div className="relative max-w-md">
          <p className="font-display text-3xl font-bold leading-snug tracking-tight">
            Build a resume that opens doors.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-300">
            Join professionals landing roles with precision-crafted, ATS-optimized resumes — with a live
            preview of exactly what a recruiter will open.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-paper-50/[0.06] p-3.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
              <div>
                <p className="text-sm font-semibold">Smart Formatting</p>
                <p className="text-xs text-ink-300">Structured layouts keep every template looking sharp.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-paper-50/[0.06] p-3.5">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" />
              <div>
                <p className="text-sm font-semibold">ATS Optimized</p>
                <p className="text-xs text-ink-300">Clean HTML output that parses well in tracking systems.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-ink-500">© {new Date().getFullYear()} ResumeForge</p>
      </div>

      <div className="flex items-center justify-center bg-paper-100 p-4 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-5 sm:mb-7 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 text-brass-400">
              <FileText className="h-4.5 w-4.5" strokeWidth={2} />
            </div>
            <span className="font-display text-lg font-semibold text-ink-900">ResumeForge</span>
          </div>

          <h1 className="font-display text-xl sm:text-[26px] font-bold tracking-tight text-ink-900">Create an account</h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-500">Start building your professional story today.</p>

          <div className="mt-5 sm:mt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}

