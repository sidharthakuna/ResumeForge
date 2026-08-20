import { useSearchParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { sampleResume } from '../lib/sample-resume'
import { TemplateGallery } from '../components/TemplateGallery'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { useCreateResume } from '@/features/resume-editor/hooks/useResume'
import { registerResumeId } from '@/features/dashboard/lib/resume-registry'
import { useInvalidateDashboard } from '@/features/dashboard/api/useDashboardResumes'

/**
 * Standalone gallery reached from the app sidebar's "Templates" link,
 * outside any specific resume — so it previews every template against
 * sample placeholder content (see lib/sample-resume.ts) rather than real
 * data. Picking "Use Template" here creates a brand-new resume (the same
 * real POST /api/resumes call Dashboard's "New resume" button makes),
 * pins the chosen template as that resume's selection, then drops the
 * person straight into the editor with it already applied.
 */
export default function TemplatesGalleryPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setSelected = useEditorUiStore((s) => s.setSelectedTemplate)
  const createResume = useCreateResume()
  const invalidate = useInvalidateDashboard()
  const [creatingId, setCreatingId] = useState<string | null>(null)

  async function handleUse(templateId: string) {
    setCreatingId(templateId)
    try {
      const created = await createResume.mutateAsync({ title: 'Untitled resume' })
      registerResumeId(created.id)
      setSelected(created.id, templateId)
      invalidate()
      navigate(`/resumes/${created.id}/edit/personal`)
    } finally {
      setCreatingId(null)
    }
  }

  return (
    <div className="px-6 py-10 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-1 pb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">Choose Your Resume Template</h1>
          <p className="max-w-2xl text-[15px] text-ink-500">
            Select from our collection of professionally designed, ATS-optimized templates to start building your
            next career move.
          </p>
        </div>

        <TemplateGallery
          full={sampleResume}
          selectedId={creatingId ?? ''}
          onSelect={handleUse}
          initialQuery={params.get('q') ?? ''}
        />

        {createResume.isPending && (
          <p className="pt-4 text-center text-sm text-ink-500">Creating your resume…</p>
        )}
      </div>
    </div>
  )
}
