import { GoogleLogin } from '@react-oauth/google'
import { useGoogleAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'

interface GoogleLoginButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
}

export function GoogleLoginButton({ text = 'continue_with' }: GoogleLoginButtonProps) {
  const googleAuthMutation = useGoogleAuth()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const handleSuccess = (credentialResponse: { credential?: string }) => {
    if (credentialResponse.credential) {
      googleAuthMutation.mutate({ credential: credentialResponse.credential })
    } else {
      toast.error('Google authentication did not return a credential token')
    }
  }

  const handleError = () => {
    toast.error('Google sign in failed or was cancelled')
  }

  // If no Client ID configured, render a clean fallback button
  if (!clientId || clientId === 'your-google-client-id-here') {
    return (
      <button
        type="button"
        onClick={() =>
          toast.info(
            'To enable Google Sign-In, add your Google OAuth Client ID to VITE_GOOGLE_CLIENT_ID in .env'
          )
        }
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-ink-200 bg-paper-50 px-4 text-xs sm:text-sm font-semibold text-ink-700 shadow-2xs hover:bg-paper-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
      >
        <GoogleIcon />
        <span>{text === 'signup_with' ? 'Sign up with Google' : 'Sign in with Google'}</span>
      </button>
    )
  }

  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        shape="rectangular"
        width="100%"
        text={text}
      />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0" aria-hidden>
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
