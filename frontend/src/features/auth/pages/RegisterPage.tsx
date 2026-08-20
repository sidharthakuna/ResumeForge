import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterShell } from '@/features/auth/components/RegisterShell'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/auth.schema'
import { useRegister } from '@/features/auth/hooks/useAuth'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const registerMutation = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  return (
    <RegisterShell>
      <button
        type="button"
        disabled
        title="Google sign-up isn't connected yet — the backend only supports email and password."
        className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-ink-100 bg-ink-50 text-sm font-medium text-ink-400"
      >
        <GoogleIcon />
        Sign up with Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-100" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-300">Or continue with email</span>
        <div className="h-px flex-1 bg-ink-100" />
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit((v) =>
          registerMutation.mutate({ email: v.email, password: v.password, fullName: v.fullName }),
        )}
        noValidate
      >
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="Jane Doe" autoComplete="name" invalid={!!errors.fullName} {...register('fullName')} />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            invalid={!!errors.email}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            invalid={!!errors.password}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <div>
          <label className="flex items-start gap-2.5 text-sm text-ink-600">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brass-500 focus:ring-2 focus:ring-brass-100"
              {...register('agreeToTerms')}
            />
            <span>
              I agree to the{' '}
              <a href="#" className="text-brass-500 underline underline-offset-2" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-brass-500 underline underline-offset-2" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
              .
            </span>
          </label>
          <FieldError message={errors.agreeToTerms?.message} />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={registerMutation.isPending}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brass-500 underline underline-offset-2">
          Log in here
        </Link>
      </p>
    </RegisterShell>
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
