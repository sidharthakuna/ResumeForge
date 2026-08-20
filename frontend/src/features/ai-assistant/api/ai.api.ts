import { apiClient, unwrap } from '@/lib/axios'
import type {
  ApiResponse,
  JobAnalysisRequest,
  JobAnalysisResponse,
  GenerateSummaryRequest,
  AiSummaryPreviewResponse,
  AiExperienceRequest,
  AiExperienceResponse,
  AiProjectRequest,
  AiProjectResponse,
  SkillPrioritizationRequest,
  SkillPrioritizationResponse,
  AtsAnalysisRequest,
  AtsAnalysisResponse,
  ResumeTailoringRequest,
  ResumeTailoringResponse,
  ParseMarkdownRequest,
  ParseMarkdownResponse,
} from '@/types/api'

export const aiApi = {
  analyzeJob: (resumeId: string, body: JobAnalysisRequest) =>
    unwrap(apiClient.post<ApiResponse<JobAnalysisResponse>>(`/api/resumes/${resumeId}/ai/analyze-job`, body)),

  previewSummary: (resumeId: string, body: GenerateSummaryRequest) =>
    unwrap(apiClient.post<ApiResponse<AiSummaryPreviewResponse>>(`/api/resumes/${resumeId}/ai/generate-summary`, body)),

  generateExperience: (resumeId: string, body: AiExperienceRequest) =>
    unwrap(apiClient.post<ApiResponse<AiExperienceResponse>>(`/api/resumes/${resumeId}/ai/generate-experience`, body)),

  generateProject: (resumeId: string, body: AiProjectRequest) =>
    unwrap(apiClient.post<ApiResponse<AiProjectResponse>>(`/api/resumes/${resumeId}/ai/generate-project`, body)),

  prioritizeSkills: (resumeId: string, body: SkillPrioritizationRequest) =>
    unwrap(apiClient.post<ApiResponse<SkillPrioritizationResponse>>(`/api/resumes/${resumeId}/ai/prioritize-skills`, body)),

  analyzeAts: (resumeId: string, body: AtsAnalysisRequest) =>
    unwrap(apiClient.post<ApiResponse<AtsAnalysisResponse>>(`/api/resumes/${resumeId}/ai/ats-check`, body)),

  tailorResume: (resumeId: string, body: ResumeTailoringRequest) =>
    unwrap(apiClient.post<ApiResponse<ResumeTailoringResponse>>(`/api/resumes/${resumeId}/ai/tailor`, body)),

  parseMarkdown: (body: ParseMarkdownRequest) =>
    unwrap(apiClient.post<ApiResponse<ParseMarkdownResponse>>('/api/ai/parse-markdown', body)),
}
