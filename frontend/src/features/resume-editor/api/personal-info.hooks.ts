import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { personalInfoApi } from './personal-info.api'
import { queryKeys } from '@/lib/query-keys'
import { ApiError } from '@/lib/axios'
import type { PersonalInfoRequest } from '@/types/api'

// Split add/update because the backend rejects a second POST — the
// editor's PersonalInfoForm decides which to call based on whether
// FullResumeResponse.personalInfo is already present.
export function useAddPersonalInfo(resumeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: PersonalInfoRequest) => personalInfoApi.add(resumeId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resume.full(resumeId) })
      toast.success('Personal info saved')
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not save personal info'),
  })
}

export function useUpdatePersonalInfo(resumeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PersonalInfoRequest }) =>
      personalInfoApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.resume.full(resumeId) })
      toast.success('Personal info updated')
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not update personal info'),
  })
}
