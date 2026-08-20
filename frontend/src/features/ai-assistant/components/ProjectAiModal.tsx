import { useState } from 'react'
import { Sparkles, X, Wand2, FolderGit2, FileCode } from 'lucide-react'
import { useGenerateProjectAi } from '@/features/ai-assistant/hooks/useAiAssistant'
import { AiPreviewBox } from './AiPreviewBox'
import { toast } from 'sonner'

interface ProjectAiModalProps {
  isOpen: boolean
  onClose: () => void
  resumeId: string
  title: string
  initialDescription?: string
  onApply: (refinedDescription: string) => void
}

export function ProjectAiModal({
  isOpen,
  onClose,
  resumeId,
  title,
  initialDescription = '',
  onApply,
}: ProjectAiModalProps) {
  const [projectTitle, setProjectTitle] = useState(title)
  const [description, setDescription] = useState(initialDescription)
  const [readmeContent, setReadmeContent] = useState('')
  const [targetJobTitle, setTargetJobTitle] = useState('')
  const [targetJobDescription, setTargetJobDescription] = useState('')
  const [generatedBullets, setGeneratedBullets] = useState<string[] | null>(null)
  const [extractedTech, setExtractedTech] = useState<string[]>([])
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([])

  const generateMutation = useGenerateProjectAi(resumeId)

  if (!isOpen) return null

  const handleGenerate = async () => {
    try {
      const res = await generateMutation.mutateAsync({
        title: projectTitle,
        currentDescription: description,
        readmeContent: readmeContent || null,
        targetJobTitle: targetJobTitle || null,
        targetJobDescription: targetJobDescription || null,
      })
      if (res && res.bullets) {
        setGeneratedBullets(res.bullets)
        setExtractedTech(res.extractedTech || [])
        setMatchedKeywords(res.matchedKeywords || [])
        toast.success('Project bullets generated!')
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
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900">
              AI Project Writer &amp; README Analyzer
            </h3>
            <p className="text-xs text-ink-600">
              Synthesize technical project highlights from notes or README.md documentation.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="projTitle" className="ai-label">Project Title</label>
            <input
              id="projTitle"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. ResumeForge Platform"
              className="ai-input mt-1"
            />
          </div>

          <div>
            <label htmlFor="projReadme" className="ai-label flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-purple-800 dark:text-purple-300">
                <FileCode className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                Paste README.md or Technical Notes (Optional)
              </span>
              <span className="text-[11px] font-normal text-ink-500 dark:text-ink-400">Markdown supported</span>
            </label>
            <textarea
              id="projReadme"
              rows={4}
              value={readmeContent}
              onChange={(e) => setReadmeContent(e.target.value)}
              placeholder="Paste your GitHub repository README.md or architecture notes here to extract technologies, database, and features..."
              className="ai-textarea mt-1 font-mono text-xs resize-y"
            />
          </div>

          <div>
            <label htmlFor="projNotes" className="ai-label">Brief Project Description / Goal</label>
            <textarea
              id="projNotes"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full-stack resume platform with Spring Boot backend, JWT authentication, PostgreSQL persistence, and Docker..."
              className="ai-textarea mt-1 resize-y"
            />
          </div>

          <div className="ai-modal-callout space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              <Sparkles className="h-3.5 w-3.5" /> Target Job Tailoring (Optional)
            </div>
            <input
              placeholder="Target Role (e.g. Java Backend Engineer, Full Stack Developer)"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              className="ai-input"
            />
            <textarea
              rows={2}
              placeholder="Paste recruiter Job Description to highlight matching technologies..."
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
              <Wand2 className="h-4 w-4" /> Generate Project Bullets
            </button>
          </div>

          {generatedBullets && (
            <div className="mt-4 pt-4 border-t border-ink-200 dark:border-ink-700 space-y-3">
              {extractedTech.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-ink-600 dark:text-ink-300">Extracted Tech:</span>
                  {extractedTech.map((tech) => (
                    <span
                      key={tech}
                      className="ai-preview-chip"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <AiPreviewBox
                title="Tailored Project Bullets"
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
