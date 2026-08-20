import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types/api'

export const authApi = {
  register: (body: RegisterRequest) =>
    unwrap(apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', body)),
  login: (body: LoginRequest) =>
    unwrap(apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', body)),
}
