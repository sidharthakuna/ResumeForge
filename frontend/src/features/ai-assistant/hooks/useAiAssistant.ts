import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { aiApi } from '@/features/ai-assistant/api/ai.api'
import { ApiError } from '@/lib/axios'
import { queryKeys } from '@/lib/query-keys'
import type {
  JobAnalysisRequest,
  GenerateSummaryRequest,
  AiExperienceRequest,
  AiProjectRequest,
  SkillPrioritizationRequest,
  AtsAnalysisRequest,
  ResumeTailoringRequest,
  ParseMarkdownRequest,
} from '@/types/api'

export function useAnalyzeJob(resumeId: string) {
  return useMutation({
    mutationFn: (body: JobAnalysisRequest) => aiApi.analyzeJob(resumeId, body),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Job analysis failed'),
  })
}

export function usePreviewSummary(resumeId: string) {
  return useMutation({
    mutationFn: (body: GenerateSummaryRequest) => aiApi.previewSummary(resumeId, body),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not generate summary preview'),
  })
}

export function useGenerateExperienceAi(resumeId: string) {
  return useMutation({
    mutationFn: (body: AiExperienceRequest) => aiApi.generateExperience(resumeId, body),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not generate experience bullets'),
  })
}

export function useGenerateProjectAi(resumeId: string) {
  return useMutation({
    mutationFn: (body: AiProjectRequest) => aiApi.generateProject(resumeId, body),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not generate project bullets'),
  })
}

export function usePrioritizeSkills(resumeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SkillPrioritizationRequest) => aiApi.prioritizeSkills(resumeId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resume.full(resumeId) })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not prioritize skills'),
  })
}

export function useAnalyzeAts(resumeId: string) {
  return useMutation({
    mutationFn: (body: AtsAnalysisRequest) => aiApi.analyzeAts(resumeId, body),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'ATS analysis failed'),
  })
}

export function useTailorResume(resumeId: string) {
  return useMutation({
    mutationFn: (body: ResumeTailoringRequest) => aiApi.tailorResume(resumeId, body),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Resume tailoring failed'),
  })
}

export function useParseMarkdown() {
  return useMutation({
    mutationFn: (body: ParseMarkdownRequest) => aiApi.parseMarkdown(body),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to parse markdown'),
  })
}
