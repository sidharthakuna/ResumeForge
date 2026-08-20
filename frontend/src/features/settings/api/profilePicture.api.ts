import { apiClient, unwrap, getApiBase } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { UserProfile } from '@/features/settings/types/profile.types'

/**
 * Returns the URL that serves the current user's avatar image.
 * Used as an <img src="..."> value. We append a cache-bust timestamp
 * so that browsers immediately show a freshly uploaded photo without
 * a stale-cache hit.
 *
 * Pass `bust=false` when you just need a stable URL (e.g. for session
 * storage) without the timestamp.
 */
export function getAvatarUrl(bust = true): string {
  const base = `${getApiBase()}/api/users/me/avatar`
  return bust ? `${base}?t=${Date.now()}` : base
}

/**
 * Upload (or replace) the current user's profile picture.
 * Sends the image as multipart/form-data under the field name "file".
 * Returns the updated UserProfile (with a new profilePictureUrl).
 */
export async function uploadProfilePicture(file: File): Promise<UserProfile> {
  const form = new FormData()
  form.append('file', file)
  return unwrap(
    apiClient.post<ApiResponse<UserProfile>>(
      '/api/users/me/avatar',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    ),
  )
}

/**
 * Remove the current user's profile picture.
 * Returns the updated UserProfile (profilePictureUrl will be null/undefined).
 */
export async function deleteProfilePicture(): Promise<UserProfile> {
  return unwrap(
    apiClient.delete<ApiResponse<UserProfile>>('/api/users/me/avatar'),
  )
}
