import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Lock } from 'lucide-react'
import { LoginShell } from '@/features/auth/components/LoginShell'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth.schema'
import { useLogin } from '@/features/auth/hooks/useAuth'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'

// Max wrong attempts tracked on the frontend before showing a strong warning.
// The real enforcement is on the backend (10 per 15 min per email).
const MAX_ATTEMPTS_BEFORE_WARNING = 5

export default function LoginPage() {
  const [params] = useSearchParams()
  const login = useLogin()
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    if (params.get('reason') === 'session_expired') {
      toast.info('Your session expired. Please sign in again.')
    }
  }, [params])

  // Countdown timer for lockout display
  useEffect(() => {
    if (!isLockedOut || !lockoutUntil) return
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000)
      if (remaining <= 0) {
        setIsLockedOut(false)
        setLockoutUntil(null)
        setFailedAttempts(0)
        setCountdown(0)
        clearInterval(interval)
      } else {
        setCountdown(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isLockedOut, lockoutUntil])

  function onSubmit(values: LoginFormValues) {
    if (isLockedOut) return
    login.mutate(values, {
      onSuccess: () => {
        setFailedAttempts(0)
      },
      onError: (err: unknown) => {
        // 429 = rate limited by the backend
        const status = (err as { status?: number })?.status
        if (status === 429) {
          // Lock out for 15 minutes matching backend window
          const until = new Date(Date.now() + 15 * 60 * 1000)
          setIsLockedOut(true)
          setLockoutUntil(until)
          setCountdown(15 * 60)
          return
        }
        setFailedAttempts((n) => n + 1)
      },
    })
  }

  const attemptsLeft = Math.max(0, 10 - failedAttempts)
  const showAttemptWarning = failedAttempts >= MAX_ATTEMPTS_BEFORE_WARNING && !isLockedOut

  function formatCountdown(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <LoginShell>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Lockout banner */}
        {isLockedOut && (
          <div className="flex items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" />
            <div>
              <p className="text-sm font-semibold text-danger-700">Too many failed attempts</p>
              <p className="mt-0.5 text-xs text-danger-600">
                Your account is temporarily locked. Try again in{' '}
                <span className="font-mono font-bold">{formatCountdown(countdown)}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Attempt warning (before lockout) */}
        {showAttemptWarning && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              {failedAttempts} failed attempt{failedAttempts !== 1 ? 's' : ''}. You have{' '}
              <span className="font-semibold">{attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''}</span>{' '}
              remaining before your account is temporarily locked.
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            invalid={!!errors.email}
            disabled={isLockedOut}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            invalid={!!errors.password}
            disabled={isLockedOut}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={login.isPending}
          disabled={isLockedOut}
        >
          {isLockedOut ? `Locked — retry in ${formatCountdown(countdown)}` : 'Sign In'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-100" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-300">Or continue with</span>
        <div className="h-px flex-1 bg-ink-100" />
      </div>

      <button
        type="button"
        disabled
        title="Google sign-in isn't connected yet — the backend only supports email and password."
        className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-ink-100 bg-ink-50 text-sm font-medium text-ink-400"
      >
        <GoogleIcon />
        Sign in with Google
      </button>

      <p className="mt-6 text-center text-sm text-ink-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brass-500 underline underline-offset-2">
          Create one now
        </Link>
      </p>
    </LoginShell>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}
