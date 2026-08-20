/**
 * Central query-key factory. Every feature's hooks import from here instead
 * of hand-writing key arrays, so invalidation stays consistent — e.g.
 * adding an education entry invalidates queryKeys.resume.full(id), and
 * every hook that reads FullResumeResponse automatically refetches.
 */
export const queryKeys = {
  resume: {
    detail: (id: string) => ['resume', id] as const,
    full: (id: string) => ['resume', id, 'full'] as const,
    previewHtml: (id: string, template: string) => ['resume', id, 'preview-html', template] as const,
  },
  templates: {
    list: () => ['templates'] as const,
  },
  generatedResumes: {
    forResume: (resumeId: string) => ['generated-resumes', resumeId] as const,
  },
}
