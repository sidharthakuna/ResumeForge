import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, SkillRequest, SkillResponse } from '@/types/api'

export const skillApi = {
  add: (resumeId: string, body: SkillRequest) =>
    unwrap(apiClient.post<ApiResponse<SkillResponse>>(`/api/resumes/${resumeId}/skills`, body)),
  update: (id: string, body: SkillRequest) =>
    unwrap(apiClient.put<ApiResponse<SkillResponse>>(`/api/resumes/skills/${id}`, body)),
  remove: (id: string) => unwrap(apiClient.delete<ApiResponse<void>>(`/api/resumes/skills/${id}`)),
}
