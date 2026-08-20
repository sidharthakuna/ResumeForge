import { apiClient, unwrap } from '@/lib/axios'
import type {
  ApiResponse,
  BackendResumeTemplate,
  CreateResumeRequest,
  FullResumeResponse,
  GenerateDeclarationRequest,
  GenerateSummaryRequest,
  PageResponse,
  ResumeResponse,
  ResumeSummaryResponse,
  UpdateResumeRequest,
} from '@/types/api'

export const resumeApi = {
  list: (page = 0, size = 50) =>
    unwrap(
      apiClient.get<ApiResponse<PageResponse<ResumeSummaryResponse>>>('/api/resumes', {
        params: { page, size },
      }),
    ),

  create: (body: CreateResumeRequest) =>
    unwrap(apiClient.post<ApiResponse<ResumeResponse>>('/api/resumes', body)),

  get: (id: string) => unwrap(apiClient.get<ApiResponse<ResumeResponse>>(`/api/resumes/${id}`)),

  getFull: (id: string) =>
    unwrap(apiClient.get<ApiResponse<FullResumeResponse>>(`/api/resumes/${id}/full`)),

  update: (id: string, body: UpdateResumeRequest) =>
    unwrap(apiClient.patch<ApiResponse<ResumeResponse>>(`/api/resumes/${id}`, body)),

  delete: (id: string) => unwrap(apiClient.delete<ApiResponse<void>>(`/api/resumes/${id}`)),

  /** ResponseEntity<String> with Content-Type text/html — NOT the {success,data,message} envelope. */
  previewHtml: async (id: string, template: BackendResumeTemplate): Promise<string> => {
    const res = await apiClient.get<string>(`/api/resumes/${id}/preview-html`, {
      params: { template },
      responseType: 'text',
    })
    return res.data
  },

  /** Raw PDF bytes for an in-editor "see it as a PDF" check (does not persist a GeneratedResume record). */
  previewPdf: async (id: string, template: BackendResumeTemplate): Promise<Blob> => {
    const res = await apiClient.get(`/api/resumes/${id}/preview-pdf`, {
      params: { template },
      responseType: 'blob',
    })
    return res.data as Blob
  },

  generateSummary: (id: string, body: GenerateSummaryRequest) =>
    unwrap(apiClient.post<ApiResponse<ResumeResponse>>(`/api/resumes/${id}/generate-summary`, body)),

  generateDeclaration: (id: string, body: GenerateDeclarationRequest) =>
    unwrap(
      apiClient.post<ApiResponse<ResumeResponse>>(`/api/resumes/${id}/generate-declaration`, body),
    ),
}
