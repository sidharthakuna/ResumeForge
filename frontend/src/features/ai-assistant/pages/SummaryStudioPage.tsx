import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Wand2,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Feather,
  Send,
  RotateCw,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import { useDashboardResumes, useInvalidateDashboard } from '@/features/dashboard/api/useDashboardResumes'
import { usePreviewSummary } from '@/features/ai-assistant/hooks/useAiAssistant'
import { useUpdateResume } from '@/features/resume-editor/hooks/useResume'
import { AiSubNav } from '@/features/ai-assistant/components/AiSubNav'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { toast } from 'sonner'
import type { AiSummaryPreviewResponse } from '@/types/api'
import '@/features/ai-assistant/styles/summaryStudio.css'

const SUMMARY_TONES = [
  {
    id: 'executive',
    label: 'Executive & Strategic',
    suffix: 'Focus on strategic leadership, architectural ownership, cross-functional delivery, and high-level business impact.',
  },
  {
    id: 'technical',
    label: 'Technical Deep-Dive',
    suffix: 'Emphasize low-level engineering excellence, modern distributed systems, data pipelines, algorithms, and tech stack proficiencies.',
  },
  {
    id: 'impact',
    label: 'Impact & Quantifiable Metrics',
    suffix: 'Highlight performance optimizations, latency reduction, cost savings, high throughput, and measurable achievements.',
  },
  {
    id: 'concise',
    label: 'Concise & Modern',
    suffix: 'Punchy 2-sentence elevator pitch tailored for modern tech startups and fast recruiter scanning.',
  },
]

export default function SummaryStudioPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: resumes, isLoading } = useDashboardResumes()
  const invalidate = useInvalidateDashboard()

  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [selectedTone, setSelectedTone] = useState('technical')
  const [summaryPreview, setSummaryPreview] = useState<AiSummaryPreviewResponse | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  // Sync selected resume
  useEffect(() => {
    if (resumes && resumes.length > 0) {
      const qId = params.get('resumeId')
      if (qId && resumes.some((r) => r.full.resume.id === qId)) {
        setSelectedResumeId(qId)
      } else if (!selectedResumeId) {
        setSelectedResumeId(resumes[0].full.resume.id)
      }
    }
  }, [resumes, params, selectedResumeId])

  const selectedResume = resumes?.find((r) => r.full.resume.id === selectedResumeId)

  // Auto-fill target role from active resume's title or personal info
  useEffect(() => {
    if (selectedResume) {
      const role = selectedResume.full.personalInfo?.jobTitle || selectedResume.full.resume.title || 'Software Engineer'
      if (!targetRole) {
        setTargetRole(role)
      }
    }
  }, [selectedResume])

  const previewMutation = usePreviewSummary(selectedResumeId)
  const updateResumeMutation = useUpdateResume(selectedResumeId)

  const handleGenerateSummary = async () => {
    if (!selectedResumeId || !targetRole.trim()) {
      toast.error('Please enter a target role or domain')
      return
    }

    const toneInstruction = SUMMARY_TONES.find((t) => t.id === selectedTone)?.suffix || ''
    const fullJobDesc = [jobDescription.trim(), toneInstruction ? `Style requirement: ${toneInstruction}` : '']
      .filter(Boolean)
      .join('\n\n')

    try {
      const res = await previewMutation.mutateAsync({
        targetJobTitle: targetRole.trim() || null,
        targetJobDescription: fullJobDesc || null,
      })
      setSummaryPreview(res)
      setApplied(false)
      toast.success('Generated AI Professional Summary!')
    } catch {
      // Handled by hook
    }
  }

  const handleApplyToResume = async () => {
    if (!selectedResume || !summaryPreview?.summary) return
    try {
      await updateResumeMutation.mutateAsync({
        summary: summaryPreview.summary,
      })
      setApplied(true)
      invalidate()
      toast.success('Summary applied to your active resume!')
    } catch {
      toast.error('Failed to apply summary')
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    toast.success('Copied summary to clipboard')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (isLoading) return <FullPageSpinner label="Loading Summary Studio…" />

  if (!resumes || resumes.length === 0) {
    return (
      <div className="summary-container text-center py-16">
        <Wand2 className="mx-auto h-12 w-12 text-purple-500 mb-3" />
        <h2 className="text-xl font-bold text-ink-900">No Resumes Found</h2>
        <p className="text-xs text-ink-500 mt-1">Create a resume to generate tailored professional summaries.</p>
        <Button onClick={() => navigate('/dashboard?create=1')} className="mt-4 gap-2">
          <Sparkles className="h-4 w-4" /> Create Resume
        </Button>
      </div>
    )
  }

  return (
    <div className="summary-container space-y-6">
      {/* Subsystem Navigation Bar */}
      <AiSubNav currentResumeId={selectedResumeId} />

      {/* Header Banner */}
      <div className="summary-header-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
              <Wand2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
                  AI Professional Summary Studio
                </h1>
                <span className="rounded-full bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 dark:text-purple-300">
                  Executive Pitch
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-600 dark:text-slate-300">
                Craft compelling, ATS-optimized opening statements highlighting your top technical competencies and measurable career outcomes.
              </p>
            </div>
          </div>

          {/* Resume Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink-500">Active Resume:</span>
            <select
              value={selectedResumeId}
              onChange={(e) => {
                setSelectedResumeId(e.target.value)
                setSummaryPreview(null)
              }}
              className="rounded-xl border border-ink-200 bg-paper-50 px-3 py-1.5 text-xs font-bold text-ink-900 shadow-2xs focus:border-purple-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
            >
              {resumes.map((r) => (
                <option key={r.full.resume.id} value={r.full.resume.id}>
                  {r.full.resume.title || 'Untitled Resume'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generation Control Studio */}
      <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80 space-y-4">
        {/* Tone Selector */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">
            Select Tone & Emphasis
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SUMMARY_TONES.map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => setSelectedTone(tone.id)}
                className={`rounded-xl p-2.5 text-left border transition-all cursor-pointer ${
                  selectedTone === tone.id
                    ? 'border-purple-500 bg-purple-50/70 text-purple-900 font-bold dark:bg-purple-950/60 dark:text-purple-200 shadow-2xs'
                    : 'border-ink-200 bg-paper-100/40 text-ink-700 hover:border-purple-300 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{tone.label}</span>
                  {selectedTone === tone.id && <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-ink-600 mb-1">
              Target Role / Domain (e.g. Lead Backend Engineer) *
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer, Full Stack Architect"
              className="w-full rounded-xl border border-ink-200 bg-paper-100/50 px-3 py-2 text-xs text-ink-900 focus:border-purple-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-600 mb-1">
              Key Requirements or Target Focus (Optional)
            </label>
            <input
              type="text"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g. Java, Spring Boot, high scalability, microservices"
              className="w-full rounded-xl border border-ink-200 bg-paper-100/50 px-3 py-2 text-xs text-ink-900 focus:border-purple-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
            />
          </div>
        </div>

        {/* Action Trigger */}
        <div className="flex items-center justify-between border-t border-ink-100/80 pt-3">
          <span className="text-[11px] text-ink-500">
            Powered by Gemini AI Professional Pitch Engine
          </span>

          <Button
            onClick={handleGenerateSummary}
            loading={previewMutation.isPending}
            className="gap-2 bg-purple-600 text-white hover:bg-purple-700 font-bold text-xs h-9 px-4 shadow-sm"
          >
            {previewMutation.isPending ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Synthesizing Summary…</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Professional Summary</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Side-by-Side Comparison: Current vs AI Generated */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Current Summary */}
        <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-ink-100/80 pb-3">
              <div className="flex items-center gap-2">
                <Feather className="h-4 w-4 text-ink-500" />
                <h4 className="text-xs font-bold text-ink-900">Current Resume Summary</h4>
              </div>
              <span className="text-[10px] font-semibold text-ink-400">
                {selectedResume?.full.resume.summary ? 'Active' : 'Empty'}
              </span>
            </div>

            <div className="mt-3 text-xs leading-relaxed text-ink-700 dark:text-slate-300">
              {selectedResume?.full.resume.summary ? (
                <p className="bg-paper-100/40 p-3.5 rounded-xl border border-ink-100/80">
                  {selectedResume.full.resume.summary}
                </p>
              ) : (
                <div className="p-6 text-center text-ink-400 border border-dashed border-ink-200 rounded-xl bg-paper-100/20">
                  <p className="text-xs">No summary currently saved in this resume.</p>
                  <p className="text-[11px] mt-0.5">Use the generator on the right to create an executive pitch.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-ink-100/80 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/resumes/${selectedResumeId}/edit/personal`)}
              className="text-xs gap-1"
            >
              <span>Edit Personal Details</span>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Right: AI Generated Summary Preview */}
        <div className="rounded-2xl border border-purple-200 bg-paper-50 p-5 shadow-sm dark:border-purple-900/60 dark:bg-paper-50/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-ink-100/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h4 className="text-xs font-bold text-ink-900">AI Synthesized Pitch</h4>
              </div>
              {summaryPreview && (
                <span className="rounded-full bg-purple-100 dark:bg-purple-950 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  {summaryPreview.tailoredFocus || 'Optimized'}
                </span>
              )}
            </div>

            <div className="mt-3">
              {summaryPreview ? (
                <div className="space-y-3">
                  <p className="bg-purple-50/50 p-3.5 rounded-xl border border-purple-100 text-xs leading-relaxed text-ink-800 dark:bg-purple-950/20 dark:border-purple-900/40 dark:text-slate-200 font-normal">
                    {summaryPreview.summary}
                  </p>

                  {/* Matched Competencies Pills */}
                  {summaryPreview.matchedSkills && summaryPreview.matchedSkills.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block mb-1">
                        Highlighted Strengths:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {summaryPreview.matchedSkills.map((sk, idx) => (
                          <span key={idx} className="summary-tag">
                            <Check className="h-3 w-3 text-purple-600" /> {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-ink-400 border border-dashed border-purple-200 dark:border-purple-900/50 rounded-xl bg-purple-50/20">
                  <Wand2 className="mx-auto h-8 w-8 text-purple-400/60 mb-2" />
                  <p className="text-xs font-semibold text-ink-700 dark:text-slate-300">Your tailored pitch will appear here.</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">Click "Generate Professional Summary" above.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          {summaryPreview && (
            <div className="mt-4 pt-3 border-t border-ink-100/80 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(summaryPreview.summary, 'ai-summary')}
                className="text-xs gap-1 h-8"
              >
                {copiedKey === 'ai-summary' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'ai-summary' ? 'Copied' : 'Copy Text'}</span>
              </Button>

              <Button
                onClick={handleApplyToResume}
                disabled={applied}
                className={`text-xs h-8 gap-1.5 font-bold ${
                  applied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                }`}
              >
                {applied ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                <span>{applied ? 'Applied to Active Resume!' : 'Apply to Resume'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
