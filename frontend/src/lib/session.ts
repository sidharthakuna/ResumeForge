import type { AuthResponse } from '@/types/api'

const TOKEN_KEY = 'rf_token'
const USER_KEY = 'rf_user'

export interface StoredUser {
  email: string
  fullName: string
  role: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.token)
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ email: auth.email, fullName: auth.fullName, role: auth.role } satisfies StoredUser),
  )
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function updateStoredUser(partial: Partial<StoredUser>): void {
  const current = getUser()
  if (current) {
    localStorage.setItem(USER_KEY, JSON.stringify({ ...current, ...partial }))
  }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
