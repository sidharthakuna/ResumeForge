import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, LanguageRequest, LanguageResponse } from '@/types/api'

export const languageApi = {
  add: (resumeId: string, body: LanguageRequest) =>
    unwrap(apiClient.post<ApiResponse<LanguageResponse>>(`/api/resumes/${resumeId}/languages`, body)),
  update: (id: string, body: LanguageRequest) =>
    unwrap(apiClient.put<ApiResponse<LanguageResponse>>(`/api/resumes/languages/${id}`, body)),
  remove: (id: string) => unwrap(apiClient.delete<ApiResponse<void>>(`/api/resumes/languages/${id}`)),
}
