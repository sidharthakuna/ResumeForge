import { apiClient, unwrap } from '@/lib/axios'
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SendOtpRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GoogleAuthRequest,
} from '@/types/api'

export const authApi = {
  register: (body: RegisterRequest) =>
    unwrap(apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', body)),
  login: (body: LoginRequest) =>
    unwrap(apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', body)),
  googleAuth: (body: GoogleAuthRequest) =>
    unwrap(apiClient.post<ApiResponse<AuthResponse>>('/api/auth/google', body)),
  sendOtp: (body: SendOtpRequest) =>
    unwrap(apiClient.post<ApiResponse<{ message: string }>>('/api/auth/send-otp', body)),
  verifyOtp: (body: VerifyOtpRequest) =>
    unwrap(apiClient.post<ApiResponse<{ message: string }>>('/api/auth/verify-otp', body)),
  forgotPassword: (body: ForgotPasswordRequest) =>
    unwrap(apiClient.post<ApiResponse<{ message: string }>>('/api/auth/forgot-password', body)),
  resetPassword: (body: ResetPasswordRequest) =>
    unwrap(apiClient.post<ApiResponse<{ message: string }>>('/api/auth/reset-password', body)),
}
