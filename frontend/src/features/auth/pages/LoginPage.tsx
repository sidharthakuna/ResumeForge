import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Lock } from 'lucide-react'
import { LoginShell } from '@/features/auth/components/LoginShell'
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth.schema'
import { useLogin } from '@/features/auth/hooks/useAuth'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'

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
        const status = (err as { status?: number })?.status
        if (status === 429) {
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
    <LoginShell
      title="Sign in to your account"
      subtitle="Enter your details to manage your resumes and exports"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Lockout banner */}
        {isLockedOut && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="text-xs">
              <p className="font-bold">Account temporarily locked</p>
              <p className="mt-0.5 opacity-90">
                Too many failed attempts. Try again in{' '}
                <span className="font-mono font-bold">{formatCountdown(countdown)}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Attempt warning */}
        {showAttemptWarning && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs">
              {failedAttempts} failed attempt{failedAttempts !== 1 ? 's' : ''}. You have{' '}
              <span className="font-bold">{attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''}</span>{' '}
              remaining before temporary lockout.
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
            className="mt-1"
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            invalid={!!errors.password}
            disabled={isLockedOut}
            className="mt-1"
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 rounded-xl shadow-md shadow-indigo-600/20"
          size="lg"
          loading={login.isPending}
          disabled={isLockedOut}
        >
          {isLockedOut ? `Locked — retry in ${formatCountdown(countdown)}` : 'Sign In'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-200/60 dark:bg-slate-800" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 dark:text-slate-500">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-ink-200/60 dark:bg-slate-800" />
      </div>

      <GoogleLoginButton text="signin_with" />

      <p className="mt-6 text-center text-xs sm:text-sm text-ink-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2"
        >
          Create an account
        </Link>
      </p>
    </LoginShell>
  )
}
