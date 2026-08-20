import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn } from '@/lib/session'

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!isLoggedIn()) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <>{children}</>
}
