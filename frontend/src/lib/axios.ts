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
 * On a genuine 401 from the backend, clear the session and bounce to
 * /login once. Guarded by `redirecting` so a burst of parallel requests
 * (e.g. dashboard's Promise.allSettled over many resumes) doesn't fire
 * the redirect N times.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401 && !redirecting) {
      redirecting = true
      clearSession()
      const next = encodeURIComponent(window.location.pathname + window.location.search)
      window.location.href = `/login?next=${next}&reason=session_expired`
    }
    const message =
      error.response?.data?.message ||
      (error.request && !error.response
        ? 'Unable to connect to the server. Service may be temporarily unavailable or down for maintenance. Please try again shortly.'
        : error.response?.status
        ? `Service error (${error.response.status}). Please try again later.`
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
