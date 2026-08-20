import { apiClient, unwrap } from '@/lib/axios'
import type {
  ApiResponse,
  BackendResumeTemplate,
  GenerateFromHtmlRequest,
  GenerateResumeResponse,
  GeneratedResumeSummary,
} from '@/types/api'

export const generationApi = {
  /** Server-rendered (Thymeleaf) export using the backend's MODERN/CLASSIC templates. */
  generate: (resumeId: string, template: BackendResumeTemplate) =>
    unwrap(
      apiClient.post<ApiResponse<GenerateResumeResponse>>(`/api/resumes/${resumeId}/generate`, {
        template,
      }),
    ),

  /**
   * Frontend-rendered export: `html` is a fully rendered document produced
   * by one of features/templates/renderers/*, `templateName` is a free-text
   * label identifying which frontend template it was.
   */
  generateFromHtml: (resumeId: string, body: GenerateFromHtmlRequest) =>
    unwrap(
      apiClient.post<ApiResponse<GenerateResumeResponse>>(
        `/api/resumes/${resumeId}/generate-from-html`,
        body,
      ),
    ),

  /**
   * Fetches the generation history for a specific resume from the backend.
   * Backend endpoint: GET /api/generated-resumes/by-resume/{resumeId}
   */
  listForResume: (resumeId: string) =>
    unwrap(
      apiClient.get<ApiResponse<GeneratedResumeSummary[]>>(
        `/api/generated-resumes/by-resume/${resumeId}`,
      ),
    ),

  download: async (generatedResumeId: string): Promise<{ blob: Blob; filename: string }> => {
    const res = await apiClient.get(`/api/generated-resumes/${generatedResumeId}/download`, {
      responseType: 'blob',
    })
    const disposition = (res.headers['content-disposition'] as string) || ''
    const match = disposition.match(/filename="?([^"]+)"?/)
    return { blob: res.data as Blob, filename: match ? match[1] : 'resume.pdf' }
  },

  delete: (generatedResumeId: string) =>
    unwrap(
      apiClient.delete<ApiResponse<void>>(`/api/generated-resumes/${generatedResumeId}`),
    ),
}
