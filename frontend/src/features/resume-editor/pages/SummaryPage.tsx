import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Wand2, ArrowRight, Target, FileText } from 'lucide-react'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { useUpdateResume, useGenerateDeclaration } from '@/features/resume-editor/hooks/useResume'
import { usePreviewSummary } from '@/features/ai-assistant/hooks/useAiAssistant'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AiPreviewBox } from '@/features/ai-assistant/components/AiPreviewBox'
import { toast } from 'sonner'
import type { AiSummaryPreviewResponse } from '@/types/api'

export default function SummaryPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const updateResume = useUpdateResume(resumeId)
  const previewSummaryMutation = usePreviewSummary(resumeId)
  const generateDeclaration = useGenerateDeclaration(resumeId)

  const [title, setTitle] = useState(full.resume.title)
  const [summary, setSummary] = useState(full.resume.summary ?? '')
  const [declaration, setDeclaration] = useState(full.resume.declaration ?? '')
  const [aiJobTitle, setAiJobTitle] = useState('')
  const [aiJobDescription, setAiJobDescription] = useState('')
  const [aiCity, setAiCity] = useState('')

  const [previewResult, setPreviewResult] = useState<AiSummaryPreviewResponse | null>(null)

  const prevSummary = useRef(full.resume.summary)
  const prevDeclaration = useRef(full.resume.declaration)
  useEffect(() => {
    if (full.resume.summary !== prevSummary.current) {
      setSummary(full.resume.summary ?? '')
      prevSummary.current = full.resume.summary
    }
    if (full.resume.declaration !== prevDeclaration.current) {
      setDeclaration(full.resume.declaration ?? '')
      prevDeclaration.current = full.resume.declaration
    }
  }, [full.resume.summary, full.resume.declaration])

  function saveAll() {
    updateResume.mutate(
      { title, summary: summary || null, declaration: declaration || null },
      { onSuccess: () => navigate(`/resumes/${resumeId}/templates`) },
    )
  }

  async function handleGeneratePreview() {
    try {
      const res = await previewSummaryMutation.mutateAsync({
        targetJobTitle: aiJobTitle || null,
        targetJobDescription: aiJobDescription || null,
      })
      if (res) {
        setPreviewResult(res)
        toast.success('AI summary preview generated!')
      }
    } catch {
      // Handled by hook toast
    }
  }

  function handleApplyPreview(appliedText: string | string[]) {
    const text = Array.isArray(appliedText) ? appliedText.join(' ') : appliedText
    setSummary(text)
    updateResume.mutate(
      { title, summary: text, declaration: declaration || null },
      {
        onSuccess: () => {
          setPreviewResult(null)
          toast.success('Summary applied and saved!')
        },
      }
    )
  }

  async function handleGenerateDeclaration() {
    await generateDeclaration.mutateAsync({ city: aiCity || null })
  }

  const isTailoredMode = Boolean(aiJobDescription.trim())

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="Summary"
        description="A short professional summary and resume title. Both can be AI-generated and tailored."
        icon={Sparkles}
        colorTone="indigo"
      />

      <div className="space-y-5">
        <Card>
          <CardBody className="space-y-4">
            <div>
              <Label htmlFor="title">Resume title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Software Engineer Resume"
              />
              <p className="mt-1 text-xs text-ink-400">
                For your own reference — this doesn't appear on the exported document.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-ink-800">Professional summary</p>
              {isTailoredMode ? (
                <Badge tone="purple" className="text-[10px] font-bold uppercase gap-1">
                  <Target className="h-3 w-3" /> Job-Tailored Mode
                </Badge>
              ) : (
                <Badge tone="indigo" className="text-[10px] font-bold uppercase">
                  General Mode
                </Badge>
              )}
            </div>
            <Badge tone="indigo">
              <Sparkles className="h-3 w-3 text-indigo-500" /> AI available
            </Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            <Textarea
              rows={5}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A 2-3 sentence summary of your experience and strengths…"
            />

            {/* AI Generator Panel */}
            <div className="rounded-[var(--radius-control)] border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  Generate Tailored Summary with AI
                </p>
                <span className="text-[11px] text-ink-400">
                  {isTailoredMode ? 'Tailored to Recruiter JD' : 'Synthesizes verified resume data'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="aiJobTitle" className="text-[11px] font-medium text-ink-600">
                    Target Job Title (Optional)
                  </Label>
                  <Input
                    id="aiJobTitle"
                    placeholder="e.g. Java Backend Engineer"
                    value={aiJobTitle}
                    onChange={(e) => setAiJobTitle(e.target.value)}
                  />
                </div>
                <div className="sm:self-end">
                  <Button
                    size="sm"
                    onClick={handleGeneratePreview}
                    loading={previewSummaryMutation.isPending}
                    className="w-full bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs font-semibold gap-1.5 rounded-lg"
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Generate &amp; Preview
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="aiJobDescription" className="text-[11px] font-medium text-ink-600">
                  Recruiter Job Description (Optional — for JD keyword tailoring)
                </Label>
                <Textarea
                  id="aiJobDescription"
                  className="mt-1"
                  rows={3}
                  placeholder="Paste job description here to tailor summary phrasing and align with required competencies..."
                  value={aiJobDescription}
                  onChange={(e) => setAiJobDescription(e.target.value)}
                />
              </div>

              {previewResult && (
                <div className="pt-2">
                  <AiPreviewBox
                    title="Generated Summary Preview"
                    content={previewResult.summary}
                    focusNote={previewResult.tailoredFocus}
                    matchedSkills={previewResult.matchedSkills}
                    badgeLabel={isTailoredMode ? 'JD Aligned' : 'General Focus'}
                    onApply={handleApplyPreview}
                    onRegenerate={handleGeneratePreview}
                    onDiscard={() => setPreviewResult(null)}
                    isApplying={updateResume.isPending}
                    isRegenerating={previewSummaryMutation.isPending}
                  />
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm font-semibold text-ink-800">Declaration</p>
            <Badge tone="indigo">
              <FileText className="h-3 w-3 text-indigo-500" /> Formal Statement
            </Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            <Textarea
              rows={3}
              value={declaration}
              onChange={(e) => setDeclaration(e.target.value)}
              placeholder="A formal declaration statement, common on some regional resume formats…"
            />
            <div className="rounded-[var(--radius-control)] border border-indigo-500/20 bg-indigo-500/5 p-3.5">
              <p className="mb-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">Generate Declaration</p>
              <div className="flex gap-2.5">
                <Input
                  placeholder="City (for the declaration line)"
                  value={aiCity}
                  onChange={(e) => setAiCity(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={handleGenerateDeclaration}
                  loading={generateDeclaration.isPending}
                  className="shrink-0 bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs font-semibold rounded-lg"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/resumes/${resumeId}/templates`)}
            className="gap-1.5 text-xs text-ink-600 hover:text-ink-900"
          >
            Next: Choose Template <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={saveAll}
            loading={updateResume.isPending}
            className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs font-semibold rounded-xl"
          >
            Save &amp; Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
