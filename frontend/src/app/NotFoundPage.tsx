import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  FileQuestion,
  Wifi,
  WifiOff,
  RefreshCw,
  Activity,
  Compass,
  Gamepad2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/layout/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { DinoRunnerGame } from '@/components/game/DinoRunnerGame'
import { toast } from 'sonner'

export default function NotFoundPage() {
  const navigate = useNavigate()

  // Real-time network detection
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [isPinging, setIsPinging] = useState(false)
  const [pingLatency, setPingLatency] = useState<number | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Connection restored!')
    }
    const handleOffline = () => {
      setIsOnline(false)
      toast.error('Network disconnected. Offline arcade mode is active.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Ping Diagnostic
  const handlePingTest = async () => {
    setIsPinging(true)
    const start = performance.now()
    try {
      await fetch(`/?_t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' })
      const elapsed = Math.round(performance.now() - start)
      setPingLatency(elapsed)
      setIsOnline(true)
      toast.success(`Server reachable (${elapsed}ms)`)
    } catch {
      setPingLatency(null)
      toast.error('Connection test failed. You may be offline.')
    } finally {
      setIsPinging(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-paper-100 font-sans text-ink-900 selection:bg-brass-100 selection:text-brass-700">
      {/* Dynamic Ambient Background Glows */}
      <div
        className="pointer-events-none absolute -left-28 -top-28 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-indigo-500/15 via-cyan-500/10 to-transparent blur-3xl dark:from-indigo-600/25 dark:via-cyan-500/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-28 top-1/3 h-[34rem] w-[34rem] rounded-full bg-gradient-to-tl from-brass-400/15 via-indigo-500/10 to-transparent blur-3xl dark:from-brass-500/20 dark:via-indigo-600/15"
        aria-hidden
      />

      {/* Top Header */}
      <header className="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="transition-transform hover:scale-[1.02]">
          <Logo size="sm" wordmark={true} />
        </Link>
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-2xs backdrop-blur-md ${
              isOnline
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isOnline ? 'System Online' : 'Offline Mode'}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Unified Content */}
      <main className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-6 pt-2 pb-16 text-center">
        {/* 1. 404 HERO SECTION */}
        <section className="flex flex-col items-center">
          {/* Animated 404 Floating Icon Card */}
          <div className="relative mb-3.5 flex items-center justify-center">
            <div className="absolute h-28 w-28 rounded-full bg-indigo-500/20 blur-xl dark:bg-indigo-500/30" />
            <div className="animate-float-soft relative flex h-20 w-16 flex-col items-center justify-between overflow-hidden rounded-xl border border-white/80 bg-paper-50/95 p-2.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-paper-50/80">
              <div className="animate-laser-scan absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              <div className="h-1.5 w-5 rounded-full bg-indigo-500/70" />
              <FileQuestion className="h-6 w-6 text-indigo-600 dark:text-indigo-400" strokeWidth={1.8} />
              <div className="h-1 w-full rounded-full bg-ink-200 dark:bg-ink-300" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-paper-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 shadow-2xs dark:border-ink-200 dark:bg-paper-50/50 dark:text-indigo-400">
            <Compass className="h-3 w-3" />
            <span>HTTP 404 • Draft Missing</span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Page Not Found
          </h1>

          <p className="mt-1 max-w-sm text-sm text-ink-600 dark:text-ink-700">
            The page or draft you're looking for doesn't exist or you may be disconnected.
          </p>

          {/* Action Buttons */}
          <div className="mt-3.5 flex items-center gap-2.5">
            <Link to="/dashboard">
              <Button variant="primary" size="sm" className="gap-1.5 shadow-sm text-xs h-8">
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1.5 text-xs h-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Go Back</span>
            </Button>
          </div>
        </section>

        {/* 2. PROMINENTLY HIGHLIGHTED OFFLINE GAME SECTION */}
        <section className="mt-7 w-full text-left">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Gamepad2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-bounce" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                T-Rex Dino Runner
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
              <Sparkles className="h-2.5 w-2.5 text-amber-600" />
              <span>Offline Runner</span>
            </span>
          </div>

          {/* Chrome Dino Runner Game */}
          <DinoRunnerGame />
        </section>

        {/* 3. CONNECTION DIAGNOSTICS & TRY AGAIN */}
        <section className="mt-5 w-full rounded-xl border border-ink-100 bg-paper-50/90 p-3.5 shadow-xs backdrop-blur-xs dark:border-ink-200 dark:bg-paper-50/50">
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-50 dark:bg-ink-100">
                {isOnline ? (
                  <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-ink-900">
                  {isOnline ? 'Network Connection Active' : 'Disconnected / Offline'}
                </div>
                <div className="text-[10px] text-ink-500">
                  {pingLatency !== null
                    ? `Ping latency: ${pingLatency}ms`
                    : 'Edits safely saved locally'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePingTest}
                loading={isPinging}
                className="gap-1 text-[11px] h-7 px-2.5"
              >
                <Activity className="h-3 w-3" />
                <span>Test Ping</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="gap-1 text-[11px] h-7 px-2.5"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Try Again</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-5 text-center text-xs text-ink-400">
        <p>© {new Date().getFullYear()} ResumeForge</p>
      </footer>
    </div>
  )
}
