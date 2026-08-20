import type { FullResumeResponse } from '@/types/api'

/**
 * A resume "section" is considered complete if it has at least one entry
 * (or, for personal-info/summary, is non-null/non-empty). This mirrors
 * what a person filling out the editor would consider "done" — it does
 * NOT come from any backend field; the backend has no completion concept.
 */
export function calculateCompletion(full: FullResumeResponse | undefined): number {
  if (!full) return 0
  const checks = [
    !!full.personalInfo,
    !!full.resume.summary,
    full.education.length > 0,
    full.experience.length > 0,
    full.projects.length > 0,
    full.skills.length > 0,
  ]
  const done = checks.filter(Boolean).length
  return Math.round((done / checks.length) * 100)
}

export interface SectionStatus {
  label: string
  complete: boolean
}

export function sectionStatuses(full: FullResumeResponse | undefined): SectionStatus[] {
  if (!full) return []
  return [
    { label: 'Personal', complete: !!full.personalInfo },
    { label: 'Summary', complete: !!full.resume.summary },
    { label: 'Education', complete: full.education.length > 0 },
    { label: 'Experience', complete: full.experience.length > 0 },
    { label: 'Projects', complete: full.projects.length > 0 },
    { label: 'Skills', complete: full.skills.length > 0 },
  ]
}
