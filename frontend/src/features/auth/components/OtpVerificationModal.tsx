import { useState, useRef, useEffect, useCallback } from 'react'
import { Mail, CheckCircle2, RefreshCw, X, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface OtpVerificationModalProps {
  isOpen: boolean
  email: string
  purpose: 'REGISTRATION' | 'PASSWORD_RESET'
  title?: string
  description?: string
  isVerifying: boolean
  onVerify: (otp: string) => void
  onResend: () => void
  onClose?: () => void
}

export function OtpVerificationModal({
  isOpen,
  email,
  title = 'Verify Your Email',
  description = 'We sent a 6-digit verification code to your email. Enter it below to complete verification.',
  isVerifying,
  onVerify,
  onResend,
  onClose,
}: OtpVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Reset and start cooldown on open
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', ''])
      setCooldown(60)
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen])

  // Cooldown countdown
  useEffect(() => {
    if (!isOpen || cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen, cooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    const char = value.slice(-1)
    newDigits[index] = char
    setDigits(newDigits)

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit if all 6 digits entered
    if (newDigits.every((d) => d !== '') && index === 5) {
      onVerify(newDigits.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
      onVerify(pastedData)
    }
  }

  const handleResendClick = useCallback(() => {
    if (cooldown > 0) return
    setCooldown(60)
    setDigits(['', '', '', '', '', ''])
    onResend()
    inputRefs.current[0]?.focus()
  }, [cooldown, onResend])

  const fullOtp = digits.join('')
  const isComplete = fullOtp.length === 6

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-ink-100 bg-paper-50 p-6 sm:p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 shadow-xs mb-3.5">
            <Mail className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-extrabold text-ink-900 tracking-tight">{title}</h3>
          <p className="mt-1 text-xs text-ink-600 dark:text-slate-300 max-w-xs">{description}</p>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink-100/80 px-3 py-1 text-xs font-semibold text-ink-800 dark:bg-slate-800 dark:text-slate-200">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-mono">{email}</span>
          </div>

          {/* 6-Digit Box Segmented Input */}
          <div className="mt-6 flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
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
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`h-12 w-10 sm:h-13 sm:w-11 rounded-xl border text-center font-mono text-xl font-extrabold transition-all outline-none ${
                  digit
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-500'
                    : 'border-ink-200 bg-paper-100/60 text-ink-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
                }`}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {/* Action Button */}
          <Button
            onClick={() => onVerify(fullOtp)}
            loading={isVerifying}
            disabled={!isComplete || isVerifying}
            className="mt-6 w-full h-11 bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-sm shadow-md shadow-indigo-600/20 gap-2 rounded-xl"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Verify &amp; Continue</span>
          </Button>

          {/* Resend Timer */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-500">
            <span>Didn't receive the code?</span>
            {cooldown > 0 ? (
              <span className="font-medium text-ink-400">Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendClick}
                className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Resend Code</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
