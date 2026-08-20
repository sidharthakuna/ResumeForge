import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, ExperienceRequest, ExperienceResponse } from '@/types/api'

export const experienceApi = {
  add: (resumeId: string, body: ExperienceRequest) =>
    unwrap(apiClient.post<ApiResponse<ExperienceResponse>>(`/api/resumes/${resumeId}/experience`, body)),
  update: (id: string, body: ExperienceRequest) =>
    unwrap(apiClient.put<ApiResponse<ExperienceResponse>>(`/api/resumes/experience/${id}`, body)),
  remove: (id: string) => unwrap(apiClient.delete<ApiResponse<void>>(`/api/resumes/experience/${id}`)),
}
