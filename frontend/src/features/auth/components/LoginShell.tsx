import type { ReactNode } from 'react'
import { Logo } from '@/components/layout/Logo'

/**
 * Centered glass-card layout for Login, matching the mockup: soft gradient
 * blobs anchored bottom-left/bottom-right, a subtle radial wash top-right,
 * and a white card with a thin top accent line floating above it all.
 * Register uses its own split-panel shell instead (see RegisterShell) —
 * the two mockup screens are different enough in shape that sharing one
 * generic AuthShell would mean compromising both.
 */
export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper-100 px-6 py-12">
      <div
        className="pointer-events-none absolute -left-24 -bottom-32 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-100 to-brass-50 opacity-70 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-28 -bottom-40 h-[28rem] w-[28rem] rounded-full bg-brass-100 opacity-60 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-72 w-72 bg-gradient-to-bl from-brass-50 to-transparent opacity-80"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-50 shadow-md">
            <Logo size="md" wordmark={false} />
          </div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-ink-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-ink-500">Log in to continue to your dashboard.</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-paper-50 p-7 shadow-xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-indigo-600" />
          {children}
        </div>
      </div>
    </div>
  )
}
