import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { templateRegistry } from '@/features/templates/renderers/registry'

interface EditorUiState {
  /** resumeId -> selected template id, so switching between resumes keeps each one's choice. */
  selectedTemplateByResume: Record<string, string>
  setSelectedTemplate: (resumeId: string, templateId: string) => void
  getSelectedTemplate: (resumeId: string) => string
}

export const useEditorUiStore = create<EditorUiState>()(
  persist(
    (set, get) => ({
      selectedTemplateByResume: {},
      setSelectedTemplate: (resumeId, templateId) =>
        set((state) => ({
          selectedTemplateByResume: { ...state.selectedTemplateByResume, [resumeId]: templateId },
        })),
      getSelectedTemplate: (resumeId) =>
        get().selectedTemplateByResume[resumeId] ?? templateRegistry[0].id,
    }),
    { name: 'rf_editor_ui' },
  ),
)
