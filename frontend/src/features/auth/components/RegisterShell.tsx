import type { ReactNode } from 'react'
import { FileText, CheckCircle2, Shield, Sparkles, Target, Award } from 'lucide-react'

export function RegisterShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] bg-slate-50 dark:bg-slate-950">
      {/* Left Panel: Enterprise Product Highlights (Desktop only) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-slate-100 lg:flex xl:p-14 border-r border-slate-800/80">

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <FileText className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <span className="font-display text-base font-extrabold tracking-tight text-white">ResumeForge</span>
            <span className="ml-2 inline-flex items-center rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
              PRO
            </span>
          </div>
        </div>

        {/* Feature Narrative */}
        <div className="relative max-w-md my-auto py-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs font-semibold text-slate-300 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI-Powered Career Suite</span>
          </div>

          <h2 className="font-display text-2xl xl:text-3xl font-extrabold leading-tight tracking-tight text-white">
            Build recruiter-ready resumes in minutes.
          </h2>
          <p className="mt-3 text-xs xl:text-sm leading-relaxed text-slate-400">
            Join candidates landing top engineering, product, and leadership roles with ATS-optimized resumes and intelligent career tailoring.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Real-Time ATS Scoring</p>
                <p className="text-[11px] text-slate-400">Analyze keyword density, layout compliance, and industry standards.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Pixel-Perfect PDF Export</p>
                <p className="text-[11px] text-slate-400">Export high-resolution vectors that parse cleanly on Greenhouse, Lever, and Workday.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Strict Data Privacy</p>
                <p className="text-[11px] text-slate-400">Your personal data is encrypted and never sold or shared.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-4">
          <span>© {new Date().getFullYear()} ResumeForge</span>
          <span>Enterprise-Grade Security</span>
        </div>
      </div>

      {/* Right Panel: Clean Form Container */}
      <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] py-4">
          {/* Mobile Brand Header */}
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <FileText className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <h1 className="text-xl font-extrabold text-ink-900 dark:text-slate-100">Create your account</h1>
            <p className="mt-1 text-xs text-ink-500 dark:text-slate-400">Start optimizing your career documents</p>
          </div>

          {/* Desktop Form Title */}
          <div className="mb-6 hidden lg:block">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 dark:text-slate-100">
              Create an account
            </h1>
            <p className="mt-1 text-xs text-ink-500 dark:text-slate-400">
              Sign up with Google or your email address to get started.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-ink-200/80 bg-paper-50 p-6 sm:p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
