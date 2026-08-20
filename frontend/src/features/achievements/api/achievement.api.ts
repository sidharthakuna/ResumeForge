import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, AchievementRequest, AchievementResponse } from '@/types/api'

export const achievementApi = {
  add: (resumeId: string, body: AchievementRequest) =>
    unwrap(
      apiClient.post<ApiResponse<AchievementResponse>>(`/api/resumes/${resumeId}/achievements`, body),
    ),
  update: (id: string, body: AchievementRequest) =>
    unwrap(apiClient.put<ApiResponse<AchievementResponse>>(`/api/resumes/achievements/${id}`, body)),
  remove: (id: string) =>
    unwrap(apiClient.delete<ApiResponse<void>>(`/api/resumes/achievements/${id}`)),
}
