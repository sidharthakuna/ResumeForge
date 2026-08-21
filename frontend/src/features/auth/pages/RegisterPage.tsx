import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterShell } from '@/features/auth/components/RegisterShell'
import { GoogleLoginButton } from '@/features/auth/components/GoogleLoginButton'
import { OtpVerificationModal } from '@/features/auth/components/OtpVerificationModal'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/auth.schema'
import { useRegister, useVerifyOtp, useSendOtp } from '@/features/auth/hooks/useAuth'
import { setSession } from '@/lib/session'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import type { AuthResponse } from '@/types/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const verifyOtpMutation = useVerifyOtp()
  const sendOtpMutation = useSendOtp()

  const [pendingAuth, setPendingAuth] = useState<AuthResponse | null>(null)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const authRes = await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      })

      setPendingAuth(authRes)
      setRegisteredEmail(values.email)
      setShowOtpModal(true)
      toast.success('Account created! A 6-digit verification code was sent to your email.')
    } catch {
      // Error handled in hook
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    try {
      await verifyOtpMutation.mutateAsync({
        email: registeredEmail,
        otp,
        purpose: 'REGISTRATION',
      })

      if (pendingAuth) {
        setSession(pendingAuth)
      }
      setShowOtpModal(false)
      toast.success(`Welcome to ResumeForge, ${pendingAuth?.fullName.split(' ')[0] || 'there'}!`)
      navigate('/dashboard', { replace: true })
    } catch {
      // Handled in mutation
    }
  }

  const handleResendOtp = async () => {
    try {
      await sendOtpMutation.mutateAsync({
        email: registeredEmail,
        purpose: 'REGISTRATION',
      })
    } catch {
      // Handled in mutation
    }
  }

  return (
    <RegisterShell>
      <GoogleLoginButton text="signup_with" />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-100" />
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-300">Or continue with email</span>
        <div className="h-px flex-1 bg-ink-100" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="Sidhartha Kuna" autoComplete="name" invalid={!!errors.fullName} {...register('fullName')} />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
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
          <label className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-600">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              {...register('agreeToTerms')}
            />
            <span>
              I agree to the{' '}
              <a href="#" className="text-indigo-600 underline underline-offset-2" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-indigo-600 underline underline-offset-2" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
              .
            </span>
          </label>
          <FieldError message={errors.agreeToTerms?.message} />
        </div>

        <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold" size="lg" loading={registerMutation.isPending}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2">
          Log in here
        </Link>
      </p>

      {/* 6-Digit Email Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        email={registeredEmail}
        purpose="REGISTRATION"
        isVerifying={verifyOtpMutation.isPending}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onClose={() => {
          if (pendingAuth) {
            setSession(pendingAuth)
            navigate('/dashboard', { replace: true })
          }
          setShowOtpModal(false)
        }}
      />
    </RegisterShell>
  )
}
