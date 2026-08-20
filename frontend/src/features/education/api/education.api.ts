import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, EducationRequest, EducationResponse } from '@/types/api'

export const educationApi = {
  add: (resumeId: string, body: EducationRequest) =>
    unwrap(apiClient.post<ApiResponse<EducationResponse>>(`/api/resumes/${resumeId}/education`, body)),
  update: (id: string, body: EducationRequest) =>
    unwrap(apiClient.put<ApiResponse<EducationResponse>>(`/api/resumes/education/${id}`, body)),
  remove: (id: string) => unwrap(apiClient.delete<ApiResponse<void>>(`/api/resumes/education/${id}`)),
}
