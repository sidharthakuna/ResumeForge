import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, CertificationRequest, CertificationResponse } from '@/types/api'

export const certificationApi = {
  add: (resumeId: string, body: CertificationRequest) =>
    unwrap(
      apiClient.post<ApiResponse<CertificationResponse>>(`/api/resumes/${resumeId}/certifications`, body),
    ),
  update: (id: string, body: CertificationRequest) =>
    unwrap(apiClient.put<ApiResponse<CertificationResponse>>(`/api/resumes/certifications/${id}`, body)),
  remove: (id: string) =>
    unwrap(apiClient.delete<ApiResponse<void>>(`/api/resumes/certifications/${id}`)),
}
