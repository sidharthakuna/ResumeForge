import axios, { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'
import { getToken, clearSession } from '@/lib/session'

/**
 * Base URL, configurable at runtime like the old app allowed (rf_api_base
 * in localStorage), falling back to the Vite env var, then to the
 * Spring Boot dev default. See settings/pages/DeveloperSettingsPage.tsx
 * for where rf_api_base gets set from the UI.
 */
export function getApiBase(): string {
  return localStorage.getItem('rf_api_base') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090'
}

export const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBase()
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let redirecting = false

/**
 * Helper to safely extract user-friendly error messages from any error object
 * (AxiosError, ApiError, standard Error, or API response objects).
 */
export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (!err) return fallback
  if (typeof err === 'string' && err.trim()) return err

  if (err instanceof ApiError && err.message?.trim()) {
    return err.message
  }

  if (axios.isAxiosError(err)) {
    const data = err.response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      if ('message' in data && typeof data.message === 'string' && data.message.trim()) {
        return data.message
      }
      if ('error' in data && typeof data.error === 'string' && data.error.trim()) {
        return data.error
      }
    }
    if (err.response?.status === 404) return 'The requested item or endpoint was not found.'
    if (err.response?.status === 403) return 'You do not have permission to perform this action.'
    if (err.response?.status === 429) return 'Too many requests. Please slow down and wait a moment.'
    if (err.response?.status && err.response.status >= 500) return 'The server encountered an error. Please try again shortly.'
    if (err.message && err.message !== 'Network Error') return err.message
  }

  if (err instanceof Error && err.message?.trim()) {
    return err.message
  }

  if (typeof err === 'object' && err !== null) {
    const record = err as Record<string, unknown>
    if (typeof record.message === 'string' && record.message.trim()) return record.message
    if (typeof record.error === 'string' && record.error.trim()) return record.error
  }

  return fallback
}

/**
 * On a genuine 401 from the backend, clear the session and bounce to
 * /login once. Guarded by `redirecting` so a burst of parallel requests
 * (e.g. dashboard's Promise.allSettled over many resumes) doesn't fire
 * the redirect N times.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401 && !redirecting) {
      // Don't auto-redirect if we are already on login or register or forgot-password page
      const currentPath = window.location.pathname
      const isAuthPath = ['/login', '/register', '/forgot-password'].some((p) => currentPath.startsWith(p))

      if (!isAuthPath) {
        redirecting = true
        clearSession()
        const next = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?next=${next}&reason=session_expired`
      }
    }

    const message =
      error.response?.data?.message ||
      (error.request && !error.response
        ? 'Unable to connect to backend server. Please verify your internet connection or try again shortly.'
        : error.response?.status === 400
        ? 'Invalid request. Please check your inputs.'
        : error.response?.status === 403
        ? 'Access denied. You do not have permission.'
        : error.response?.status === 404
        ? 'Requested resource not found.'
        : error.response?.status === 429
        ? 'Rate limit exceeded. Please wait a moment.'
        : error.response?.status
        ? `Server error (${error.response.status}). Please try again later.`
        : 'An unexpected network error occurred. Please try again.')

    return Promise.reject(new ApiError(message, error.response?.status ?? 0))
  },
)

/** Unwraps { success, data, message } and returns just `data`, typed. */
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise
  if (!res.data.success) {
    throw new ApiError(res.data.message ?? 'Request failed', 0)
  }
  return res.data.data as T
}
