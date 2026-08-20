import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import { ApiError } from '@/lib/axios'

interface SubResourceApi<TRequest, TResponse> {
  add: (resumeId: string, body: TRequest) => Promise<TResponse>
  update: (id: string, body: TRequest) => Promise<TResponse>
  remove: (id: string) => Promise<void>
}

/**
 * Every FullResumeResponse sub-array (education, experience, projects,
 * skills, certifications, achievements, languages) is edited through the
 * same add/update/remove shape and invalidates the same parent query —
 * queryKeys.resume.full(resumeId). This factory keeps that logic in one
 * place instead of seven near-identical copies.
 */
export function createSubResourceHooks<TRequest, TResponse>(
  api: SubResourceApi<TRequest, TResponse>,
  noun: string,
) {
  function useAdd(resumeId: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (body: TRequest) => api.add(resumeId, body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeys.resume.full(resumeId) })
        toast.success(`${noun} added`)
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : `Could not add ${noun.toLowerCase()}`),
    })
  }

  function useUpdate(resumeId: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: ({ id, body }: { id: string; body: TRequest }) => api.update(id, body),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeys.resume.full(resumeId) })
        toast.success(`${noun} updated`)
      },
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : `Could not update ${noun.toLowerCase()}`),
    })
  }

  function useRemove(resumeId: string) {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: (id: string) => api.remove(id),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeys.resume.full(resumeId) })
        toast.success(`${noun} removed`)
      },
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : `Could not remove ${noun.toLowerCase()}`),
    })
  }

  return { useAdd, useUpdate, useRemove }
}
