import { useNavigate } from 'react-router-dom'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { TemplateGallery } from '../components/TemplateGallery'
import { SectionHeader } from '@/components/feedback/SectionHeader'

// Per-resume gallery, reached inside the editor at /resumes/:id/templates.
// Renders every template against this resume's actual live data.
export default function TemplatesPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const selectedId = useEditorUiStore((s) => s.getSelectedTemplate(resumeId))
  const setSelected = useEditorUiStore((s) => s.setSelectedTemplate)

  function handleSelect(templateId: string) {
    setSelected(resumeId, templateId)
    navigate(`/resumes/${resumeId}/export`)
  }

  return (
    <div className="px-3.5 py-4 sm:px-6 sm:py-8 lg:px-8">
      <SectionHeader
        title="Templates"
        description="Pick a look for your exported resume. Your choice carries over to the Export tab."
      />
      <TemplateGallery full={full} selectedId={selectedId} onSelect={handleSelect} />
    </div>
  )
}

