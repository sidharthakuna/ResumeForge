import { useGoogleLogin } from '@react-oauth/google'
import { useGoogleAuth } from '@/features/auth/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import { toast } from 'sonner'

interface GoogleLoginButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

export function GoogleLoginButton({ text = 'continue_with' }: GoogleLoginButtonProps) {
  const googleAuthMutation = useGoogleAuth()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      if (tokenResponse?.access_token) {
        googleAuthMutation.mutate({ credential: tokenResponse.access_token })
      } else {
        toast.error('Google authentication did not return a valid credential')
      }
    },
    onError: (error) => {
      console.error('Google sign-in error:', error)
      toast.error('Google sign in was cancelled or failed')
    },
  })

  const label =
    text === 'signup_with'
      ? 'Sign up with Google'
      : text === 'signin_with'
      ? 'Sign in with Google'
      : 'Continue with Google'

  const handleClick = () => {
    if (!clientId || clientId === 'your-copied-client-id.apps.googleusercontent.com' || clientId.includes('dummy')) {
      toast.info(
        'To enable Google Sign-In, add your Google OAuth Client ID to VITE_GOOGLE_CLIENT_ID in your environment settings.'
      )
      return
    }
    handleGoogleLogin()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={googleAuthMutation.isPending}
      className="group relative flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-ink-200/90 bg-paper-50 px-4 text-xs sm:text-sm font-bold text-ink-800 shadow-2xs hover:bg-paper-100/80 hover:border-ink-300 active:scale-[0.99] transition-all cursor-pointer dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {googleAuthMutation.isPending ? (
        <Spinner size="sm" />
      ) : (
        <GoogleLogo />
      )}
      <span className="tracking-tight">{label}</span>
    </button>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}
