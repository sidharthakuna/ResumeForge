import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, ArrowLeft, CheckCircle2, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react'
import { LoginShell } from '@/features/auth/components/LoginShell'
import { useForgotPassword, useResetPassword } from '@/features/auth/hooks/useAuth'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const forgotPasswordMutation = useForgotPassword()
  const resetPasswordMutation = useResetPassword()

  const [step, setStep] = useState<'EMAIL' | 'RESET' | 'SUCCESS'>('EMAIL')
  const [email, setEmail] = useState('')
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [cooldown, setCooldown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Cooldown countdown timer for resending OTP
  useEffect(() => {
    if (step !== 'RESET' || cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [step, cooldown])

  // Focus first digit when switching to reset step
  useEffect(() => {
    if (step === 'RESET') {
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [step])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    try {
      await forgotPasswordMutation.mutateAsync({ email: email.trim() })
      setStep('RESET')
      setCooldown(60)
    } catch {
      // Handled in mutation hook
    }
  }

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    const char = value.slice(-1)
    newDigits[index] = char
    setDigits(newDigits)

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{6}$/.test(pastedData)) {
      const newDigits = pastedData.split('')
      setDigits(newDigits)
      inputRefs.current[5]?.focus()
    }
  }

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return
    setCooldown(60)
    setDigits(['', '', '', '', '', ''])
    await forgotPasswordMutation.mutateAsync({ email: email.trim() })
    inputRefs.current[0]?.focus()
  }, [cooldown, email, forgotPasswordMutation])

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = digits.join('')

    if (otp.length !== 6) {
      toast.error('Please enter the full 6-digit code')
      return
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      await resetPasswordMutation.mutateAsync({
        email: email.trim(),
        otp,
        newPassword,
      })
      setStep('SUCCESS')
    } catch {
      // Handled in mutation hook
    }
  }

  return (
    <LoginShell>
      {step === 'EMAIL' && (
        <form onSubmit={handleSendCode} className="space-y-4" noValidate>
          <div className="text-center sm:text-left mb-2">
            <h2 className="text-lg font-bold text-ink-900">Reset your password</h2>
            <p className="mt-1 text-xs text-ink-500">
              Enter your account email and we'll send you a 6-digit verification code to reset your password.
            </p>
          </div>

          <div>
            <Label htmlFor="reset-email">Account Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            size="lg"
            loading={forgotPasswordMutation.isPending}
          >
            Send Verification Code
          </Button>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}

      {step === 'RESET' && (
        <form onSubmit={handleResetSubmit} className="space-y-4" noValidate>
          <div className="text-center sm:text-left mb-2">
            <h2 className="text-lg font-bold text-ink-900">Enter code &amp; new password</h2>
            <p className="mt-1 text-xs text-ink-500">
              Code sent to <span className="font-semibold text-ink-800 dark:text-slate-200">{email}</span>.
            </p>
          </div>

          {/* 6-Digit OTP Box Input */}
          <div>
            <Label className="mb-2 block">6-Digit Verification Code</Label>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(index, e)}
                  className={`h-11 w-9 sm:h-12 sm:w-11 rounded-xl border text-center font-mono text-lg font-extrabold transition-all outline-none ${
                    digit
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-2 ring-indigo-500/20 dark:bg-indigo-950/30 dark:text-indigo-300'
                      : 'border-ink-200 bg-paper-100/60 text-ink-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            size="lg"
            loading={resetPasswordMutation.isPending}
          >
            Update Password &amp; Sign In
          </Button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setStep('EMAIL')}
              className="text-ink-500 hover:text-ink-700 cursor-pointer"
            >
              Change email
            </button>

            {cooldown > 0 ? (
              <span className="text-ink-400">Resend code in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Resend Code
              </button>
            )}
          </div>
        </form>
      )}

      {step === 'SUCCESS' && (
        <div className="text-center space-y-4 py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-ink-900">Password Reset Complete</h2>
          <p className="text-xs text-ink-600 dark:text-slate-300">
            Your password has been securely updated. You can now log in to your account with your new credentials.
          </p>
          <Button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11"
          >
            Go to Sign In
          </Button>
        </div>
      )}
    </LoginShell>
  )
}
