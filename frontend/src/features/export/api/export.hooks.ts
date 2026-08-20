import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { generationApi } from './generation.api'
import { queryKeys } from '@/lib/query-keys'
import { ApiError } from '@/lib/axios'
import type { GenerateFromHtmlRequest } from '@/types/api'

export function useGeneratedResumes(resumeId: string) {
  return useQuery({
    queryKey: queryKeys.generatedResumes.forResume(resumeId),
    queryFn: () => generationApi.listForResume(resumeId),
  })
}

export function useGenerateFromHtml(resumeId: string) {
  const qc = useQueryClient()
  const downloadMutation = useDownloadGeneratedResume()

  return useMutation({
    mutationFn: (body: GenerateFromHtmlRequest) => generationApi.generateFromHtml(resumeId, body),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.generatedResumes.forResume(resumeId) })
      toast.success('Resume exported successfully! Downloading PDF...')
      downloadMutation.mutate(data.generatedResumeId)
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not export resume'),
  })
}

export function useDownloadGeneratedResume() {
  return useMutation({
    mutationFn: (generatedResumeId: string) => generationApi.download(generatedResumeId),
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not download file'),
  })
}

export function useDeleteGeneratedResume(resumeId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (generatedResumeId: string) => generationApi.delete(generatedResumeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.generatedResumes.forResume(resumeId) })
      toast.success('Export removed from history')
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not delete export'),
  })
}
