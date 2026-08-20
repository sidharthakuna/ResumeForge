import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, ProjectRequest, ProjectResponse } from '@/types/api'

export const projectApi = {
  add: (resumeId: string, body: ProjectRequest) =>
    unwrap(apiClient.post<ApiResponse<ProjectResponse>>(`/api/resumes/${resumeId}/projects`, body)),
  update: (id: string, body: ProjectRequest) =>
    unwrap(apiClient.put<ApiResponse<ProjectResponse>>(`/api/resumes/projects/${id}`, body)),
  remove: (id: string) => unwrap(apiClient.delete<ApiResponse<void>>(`/api/resumes/projects/${id}`)),
}
