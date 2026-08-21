import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/features/auth/api/auth.api'
import { setSession, clearSession } from '@/lib/session'
import { getErrorMessage } from '@/lib/axios'
import type {
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GoogleAuthRequest,
} from '@/types/api'

export function useLogin() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (auth) => {
      setSession(auth)
      toast.success(`Welcome back, ${auth.fullName.split(' ')[0]}`)
      const next = params.get('next')
      navigate(next ? decodeURIComponent(next) : '/dashboard', { replace: true })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Invalid email or password'))
    },
  })
}

export function useGoogleAuth() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  return useMutation({
    mutationFn: (body: GoogleAuthRequest) => authApi.googleAuth(body),
    onSuccess: (auth) => {
      setSession(auth)
      toast.success(`Signed in with Google as ${auth.fullName.split(' ')[0]}`)
      const next = params.get('next')
      navigate(next ? decodeURIComponent(next) : '/dashboard', { replace: true })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Google authentication failed. Please try again.'))
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not create your account. Please check your details.'))
    },
  })
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (body: SendOtpRequest) => authApi.sendOtp(body),
    onSuccess: (res) => {
      toast.success(res?.message || 'Verification code sent to your email')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to send verification code. Please try again.'))
    },
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (body: VerifyOtpRequest) => authApi.verifyOtp(body),
    onSuccess: (res) => {
      toast.success(res?.message || 'Email successfully verified!')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Incorrect or expired verification code.'))
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: ForgotPasswordRequest) => authApi.forgotPassword(body),
    onSuccess: (res) => {
      toast.success(res?.message || 'Password reset instructions sent to your email')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to request password reset.'))
    },
  })
}

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: ResetPasswordRequest) => authApi.resetPassword(body),
    onSuccess: (res) => {
      toast.success(res?.message || 'Password reset successfully! Please log in.')
      navigate('/login', { replace: true })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to reset password. Please verify the code.'))
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  return () => {
    clearSession()
    navigate('/login', { replace: true })
  }
}
