import { useQuery, useQueryClient } from '@tanstack/react-query'
import { resumeApi } from '@/features/resume-editor/api/resume.api'
import { generationApi } from '@/features/export/api/generation.api'
import { listRegisteredResumeIds, unregisterResumeId } from '@/features/dashboard/lib/resume-registry'
import type { FullResumeResponse } from '@/types/api'

export interface DashboardResume {
  full: FullResumeResponse
  addedAt: string
  /** Count of real GeneratedResumeSummary rows for this resume (see generationApi.listForResume). 0 if the fetch failed, so one broken resume never blanks the whole stat. */
  downloadCount: number
}

export function useDashboardResumes() {
  return useQuery({
    queryKey: ['dashboard-resumes'],
    queryFn: async (): Promise<DashboardResume[]> => {
      let idsToFetch: { id: string; addedAt: string }[] = []

      try {
        const pageData = await resumeApi.list(0, 50)
        if (pageData && pageData.content) {
          idsToFetch = pageData.content.map((r) => ({
            id: r.id,
            addedAt: r.updatedAt,
          }))
        }
      } catch {
        // Fallback to local storage registry if list endpoint is unreachable
        idsToFetch = listRegisteredResumeIds()
      }

      // Merge with any locally created resumes not yet returned by list endpoint
      const localRegistry = listRegisteredResumeIds()
      for (const local of localRegistry) {
        if (!idsToFetch.some((item) => item.id === local.id)) {
          idsToFetch.push(local)
        }
      }

      if (idsToFetch.length === 0) return []

      const results = await Promise.allSettled(
        idsToFetch.map(async (e) => {
          const full = await resumeApi.getFull(e.id)
          const generations = await generationApi.listForResume(e.id).catch(() => [])
          return { full, downloadCount: generations.length, addedAt: e.addedAt }
        }),
      )

      const resumes: DashboardResume[] = []
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          resumes.push({
            full: res.value.full,
            downloadCount: res.value.downloadCount,
            addedAt: res.value.addedAt || idsToFetch[i].addedAt,
          })
        } else {
          // Prune dangling deleted ID from local storage
          unregisterResumeId(idsToFetch[i].id)
        }
      })
      return resumes
    },
  })
}

export function useInvalidateDashboard() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: ['dashboard-resumes'] })
}
