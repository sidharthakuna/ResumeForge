import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resumeApi } from '@/features/resume-editor/api/resume.api'
import { queryKeys } from '@/lib/query-keys'
import { ApiError } from '@/lib/axios'
import type {
  BackendResumeTemplate,
  CreateResumeRequest,
  GenerateDeclarationRequest,
  GenerateSummaryRequest,
  UpdateResumeRequest,
} from '@/types/api'

export function useFullResume(resumeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.resume.full(resumeId ?? ''),
    queryFn: () => resumeApi.getFull(resumeId as string),
    enabled: !!resumeId,
  })
}

export function useCreateResume() {
  return useMutation({
    mutationFn: (body: CreateResumeRequest) => resumeApi.create(body),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not create resume'),
  })
}

export function useUpdateResume(resumeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateResumeRequest) => resumeApi.update(resumeId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resume.full(resumeId) })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not save changes'),
  })
}

export function useDeleteResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (resumeId: string) => resumeApi.delete(resumeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard-resumes'] })
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not delete resume'),
  })
}

export function useGenerateSummary(resumeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GenerateSummaryRequest) => resumeApi.generateSummary(resumeId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resume.full(resumeId) })
      toast.success('Summary generated')
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : 'Could not generate a summary'),
  })
}

export function useGenerateDeclaration(resumeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GenerateDeclarationRequest) => resumeApi.generateDeclaration(resumeId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resume.full(resumeId) })
      toast.success('Declaration generated')
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not generate a declaration'),
  })
}

export function usePreviewHtml(resumeId: string | undefined, template: BackendResumeTemplate) {
  return useQuery({
    queryKey: queryKeys.resume.previewHtml(resumeId ?? '', template),
    queryFn: () => resumeApi.previewHtml(resumeId as string, template),
    enabled: !!resumeId,
    staleTime: 0, // preview should always reflect the latest saved state
  })
}
