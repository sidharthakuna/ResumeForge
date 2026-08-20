import { useState } from 'react'
import { Sparkles, X, Wand2, Briefcase } from 'lucide-react'
import { useGenerateExperienceAi } from '@/features/ai-assistant/hooks/useAiAssistant'
import { AiPreviewBox } from './AiPreviewBox'
import { toast } from 'sonner'

interface ExperienceAiModalProps {
  isOpen: boolean
  onClose: () => void
  resumeId: string
  company: string
  jobTitle: string
  initialDescription?: string
  onApply: (refinedDescription: string) => void
}

export function ExperienceAiModal({
  isOpen,
  onClose,
  resumeId,
  company,
  jobTitle,
  initialDescription = '',
  onApply,
}: ExperienceAiModalProps) {
  const [roleTitle, setRoleTitle] = useState(jobTitle)
  const [companyName, setCompanyName] = useState(company)
  const [description, setDescription] = useState(initialDescription)
  const [targetJobTitle, setTargetJobTitle] = useState('')
  const [targetJobDescription, setTargetJobDescription] = useState('')
  const [generatedBullets, setGeneratedBullets] = useState<string[] | null>(null)
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([])

  const generateMutation = useGenerateExperienceAi(resumeId)

  if (!isOpen) return null

  const handleGenerate = async () => {
    try {
      const res = await generateMutation.mutateAsync({
        company: companyName,
        jobTitle: roleTitle,
        currentDescription: description,
        targetJobTitle: targetJobTitle || null,
        targetJobDescription: targetJobDescription || null,
      })
      if (res && res.bullets) {
        setGeneratedBullets(res.bullets)
        setMatchedKeywords(res.matchedKeywords || [])
        toast.success('Experience bullets generated!')
      }
    } catch {
      // toast handled in hook
    }
  }

  const handleApply = (content: string | string[]) => {
    const formatted = Array.isArray(content) ? content.map((b) => `• ${b}`).join('\n') : content
    onApply(formatted)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="ai-modal-box relative max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="ai-modal-header">
          <div className="ai-header-icon-box">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900">
              AI Experience Enhancer
            </h3>
            <p className="text-xs text-ink-600">
              Generate strong action-verb bullet points grounded in your actual work.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="expRole" className="ai-label">Role / Job Title</label>
              <input
                id="expRole"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Backend Engineer"
                className="ai-input mt-1"
              />
            </div>
            <div>
              <label htmlFor="expCompany" className="ai-label">Company</label>
              <input
                id="expCompany"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Tech"
                className="ai-input mt-1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="expNotes" className="ai-label">What did you do in this role? (Rough notes or current description)</label>
            <textarea
              id="expNotes"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worked on Java APIs, built database tables in PostgreSQL, added JWT auth, reduced response time by 40%..."
              className="ai-textarea mt-1 resize-y"
            />
          </div>

          <div className="ai-modal-callout space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              <Briefcase className="h-3.5 w-3.5" /> Target Job Context (Optional Tailoring)
            </div>
            <input
              placeholder="Target Role (e.g. Senior Java Developer)"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              className="ai-input"
            />
            <textarea
              rows={2}
              placeholder="Paste recruiter Job Description to emphasize relevant keywords and competencies..."
              value={targetJobDescription}
              onChange={(e) => setTargetJobDescription(e.target.value)}
              className="ai-textarea resize-y"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="ai-btn-primary"
            >
              <Wand2 className="h-4 w-4" /> Generate Bullets
            </button>
          </div>

          {generatedBullets && (
            <div className="mt-4 pt-4 border-t border-ink-200 dark:border-ink-700">
              <AiPreviewBox
                title="Refined Experience Bullets"
                content={generatedBullets}
                matchedSkills={matchedKeywords}
                onApply={handleApply}
                onRegenerate={handleGenerate}
                onDiscard={() => setGeneratedBullets(null)}
                isRegenerating={generateMutation.isPending}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
