import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/features/auth/api/auth.api'
import { setSession, clearSession } from '@/lib/session'
import { ApiError } from '@/lib/axios'
import type { LoginRequest, RegisterRequest } from '@/types/api'

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
      toast.error(err instanceof ApiError ? err.message : 'Could not sign in')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: (auth) => {
      setSession(auth)
      toast.success(`Welcome to ResumeForge, ${auth.fullName.split(' ')[0]}`)
      navigate('/dashboard', { replace: true })
    },
    onError: (err) => {
      // Backend intentionally returns a generic "Registration failed" for a
      // duplicate email (InvalidCredentialsException) rather than confirming
      // which emails are registered — see AuthService.register.
      toast.error(err instanceof ApiError ? err.message : 'Could not create your account')
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
