import { useState } from 'react'
import { Sparkles, Info, ArrowRight, Bot, Target, ShieldCheck, CheckCircle2, Wand2, BarChart2, Layers } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { useUpdateResume, useGenerateDeclaration } from '@/features/resume-editor/hooks/useResume'
import {
  useAnalyzeJob,
  usePreviewSummary,
  useAnalyzeAts,
  usePrioritizeSkills,
} from '@/features/ai-assistant/hooks/useAiAssistant'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { JobMatchBadgeList } from '@/features/ai-assistant/components/JobMatchBadgeList'
import { AtsScoreMeter } from '@/features/ai-assistant/components/AtsScoreMeter'
import { AiPreviewBox } from '@/features/ai-assistant/components/AiPreviewBox'
import { toast } from 'sonner'
import type {
  JobAnalysisResponse,
  AiSummaryPreviewResponse,
  AtsAnalysisResponse,
  SkillPrioritizationResponse,
} from '@/types/api'

export default function AiAssistantPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const updateResume = useUpdateResume(resumeId)
  const generateDeclaration = useGenerateDeclaration(resumeId)

  const analyzeJobMutation = useAnalyzeJob(resumeId)
  const previewSummaryMutation = usePreviewSummary(resumeId)
  const atsAnalysisMutation = useAnalyzeAts(resumeId)
  const prioritizeSkillsMutation = usePrioritizeSkills(resumeId)

  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [city, setCity] = useState('')

  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisResponse | null>(null)
  const [summaryPreview, setSummaryPreview] = useState<AiSummaryPreviewResponse | null>(null)
  const [atsAnalysis, setAtsAnalysis] = useState<AtsAnalysisResponse | null>(null)
  const [skillPrioritization, setSkillPrioritization] = useState<SkillPrioritizationResponse | null>(null)

  const isTailoredMode = Boolean(jobDescription.trim())

  const handleAnalyzeJob = async () => {
    try {
      const res = await analyzeJobMutation.mutateAsync({
        targetJobTitle: jobTitle || null,
        targetJobDescription: jobDescription || null,
      })
      if (res) {
        setJobAnalysis(res)
        toast.success('Job analysis completed!')
      }
    } catch {
      // toast handled in hook
    }
  }

  const handleGenerateSummary = async () => {
    try {
      const res = await previewSummaryMutation.mutateAsync({
        targetJobTitle: jobTitle || null,
        targetJobDescription: jobDescription || null,
      })
      if (res) {
        setSummaryPreview(res)
        toast.success('Tailored summary generated!')
      }
    } catch {
      // toast handled in hook
    }
  }

  const handleApplySummary = (content: string | string[]) => {
    const text = Array.isArray(content) ? content.join(' ') : content
    updateResume.mutate(
      {
        title: full.resume.title,
        summary: text,
        declaration: full.resume.declaration,
      },
      {
        onSuccess: () => {
          setSummaryPreview(null)
          toast.success('Summary applied to resume!')
        },
      }
    )
  }

  const handleRunAtsCheck = async () => {
    try {
      const res = await atsAnalysisMutation.mutateAsync({
        targetJobTitle: jobTitle || null,
        targetJobDescription: jobDescription || null,
      })
      if (res) {
        setAtsAnalysis(res)
        toast.success('ATS analysis generated!')
      }
    } catch {
      // toast handled in hook
    }
  }

  const handlePrioritizeSkills = async () => {
    try {
      const res = await prioritizeSkillsMutation.mutateAsync({
        targetJobTitle: jobTitle || null,
        targetJobDescription: jobDescription || null,
      })
      if (res) {
        setSkillPrioritization(res)
        toast.success('Skills prioritized based on job relevance!')
      }
    } catch {
      // toast handled in hook
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="AI Assistant"
        description="Analyze job requirements, tailor professional summaries, prioritize skills, and run ATS checks."
        icon={Bot}
        colorTone="purple"
      />

      <div className="mb-6 flex items-start gap-2.5 rounded-[var(--radius-card)] border border-purple-500/20 bg-purple-50/50 p-4 text-xs text-ink-700 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-ink-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
        <p>
          <strong>Job-Tailored Intelligence:</strong> Paste a recruiter's Job Description below to analyze matching skills, generate tailored summaries, prioritize existing competencies, and inspect your ATS score. All output is strictly grounded in your verified resume data.
        </p>
      </div>

      <div className="space-y-6">
        {/* Targeting & JD Card */}
        <div className="ai-card">
          <div className="ai-card-header">
            <div className="flex items-center gap-2.5">
              <div className="ai-card-header-icon">
                <Target className="h-4 w-4" />
              </div>
              <p className="ai-card-title">
                Target Role &amp; Recruiter Job Description
              </p>
            </div>
            {isTailoredMode && (
              <Badge tone="purple" className="text-[10px] font-bold uppercase gap-1">
                <Sparkles className="h-3 w-3" /> Job-Tailored Mode
              </Badge>
            )}
          </div>
          <div className="ai-card-body space-y-4">
            <div>
              <label htmlFor="targetJobTitle" className="ai-label">Target Job Title <span className="ai-label-sub">(optional)</span></label>
              <input
                id="targetJobTitle"
                placeholder="e.g. Java Backend Developer, Full Stack Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="ai-input mt-1"
              />
            </div>
            <div>
              <label htmlFor="targetJobDesc" className="ai-label">Recruiter Job Description <span className="ai-label-sub">(optional)</span></label>
              <textarea
                id="targetJobDesc"
                rows={4}
                placeholder="Paste the recruiter's Job Description to analyze keywords and tailor resume phrasing..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="ai-textarea mt-1 resize-y"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAnalyzeJob}
                disabled={analyzeJobMutation.isPending}
                className="ai-btn-outline-purple"
              >
                <Target className="h-3.5 w-3.5" /> Analyze Job Match
              </button>
              <button
                type="button"
                onClick={handleRunAtsCheck}
                disabled={atsAnalysisMutation.isPending}
                className="ai-btn-outline-indigo"
              >
                <BarChart2 className="h-3.5 w-3.5" /> Run ATS Check
              </button>
              <button
                type="button"
                onClick={handlePrioritizeSkills}
                disabled={prioritizeSkillsMutation.isPending}
                className="ai-btn-outline-indigo"
              >
                <Layers className="h-3.5 w-3.5" /> Prioritize Skills
              </button>
            </div>

            {jobAnalysis && (
              <div className="ai-signals-panel">
                <div className="ai-signals-header">
                  <p className="ai-signals-title">
                    Job Match Analysis ({jobAnalysis.jobTitle})
                  </p>
                  <span className="ai-signals-score">
                    Match Score: {jobAnalysis.matchScore}%
                  </span>
                </div>
                <div className="mt-3">
                  <JobMatchBadgeList
                    matches={jobAnalysis.skillMatches}
                    matchedKeywords={jobAnalysis.keywords}
                    missingKeywords={jobAnalysis.missingSkills}
                  />
                </div>
              </div>
            )}

            {atsAnalysis && (
              <div className="mt-4">
                <AtsScoreMeter analysis={atsAnalysis} />
              </div>
            )}

            {skillPrioritization && (
              <div className="ai-current-highlight-indigo space-y-2.5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
                  <Layers className="h-3.5 w-3.5" /> Prioritized Resume Skills (Most Relevant First)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skillPrioritization.prioritizedSkills.map((s, idx) => (
                    <span
                      key={s}
                      className="ai-badge-prioritized"
                    >
                      {idx + 1}. {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="ai-card">
          <div className="ai-card-header">
            <div className="flex items-center gap-2.5">
              <div className="ai-card-header-icon">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="ai-card-title">
                Professional Summary Generator
              </p>
            </div>
            {full.resume.summary && (
              <Badge tone="emerald" className="gap-1 text-[10px]">
                <CheckCircle2 className="h-3 w-3" /> Active on Resume
              </Badge>
            )}
          </div>
          <div className="ai-card-body space-y-4">
            <p className="text-xs text-ink-600 dark:text-ink-400">
              Generates a punchy 2–4 sentence summary highlighting your strongest verified competencies.
            </p>

            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={previewSummaryMutation.isPending}
              className="ai-btn-primary"
            >
              <Wand2 className="h-4 w-4" /> Generate &amp; Preview Summary
            </button>

            {summaryPreview && (
              <div className="pt-2">
                <AiPreviewBox
                  title="Generated Professional Summary"
                  content={summaryPreview.summary}
                  focusNote={summaryPreview.tailoredFocus}
                  matchedSkills={summaryPreview.matchedSkills}
                  onApply={handleApplySummary}
                  onRegenerate={handleGenerateSummary}
                  onDiscard={() => setSummaryPreview(null)}
                  isApplying={updateResume.isPending}
                  isRegenerating={previewSummaryMutation.isPending}
                />
              </div>
            )}

            {full.resume.summary && (
              <div className="ai-current-highlight-purple">
                <p className="ai-current-label-purple">Current Summary</p>
                <p className="ai-current-text">{full.resume.summary}</p>
                <Link
                  to={`/resumes/${resumeId}/edit/summary`}
                  className="mt-2.5 flex w-fit items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
                >
                  Edit on Summary Page <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Declaration Card */}
        <div className="ai-card">
          <div className="ai-card-header">
            <div className="flex items-center gap-2.5">
              <div className="ai-card-header-icon">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="ai-card-title">
                Formal Declaration Statement
              </p>
            </div>
          </div>
          <div className="ai-card-body space-y-4">
            <div>
              <label htmlFor="city" className="ai-label">City (for declaration line)</label>
              <input id="city" placeholder="e.g. Hyderabad, San Francisco" value={city} onChange={(e) => setCity(e.target.value)} className="ai-input mt-1" />
            </div>
            <button
              type="button"
              onClick={() => generateDeclaration.mutate({ city: city || null })}
              disabled={generateDeclaration.isPending}
              className="ai-btn-primary"
            >
              <Sparkles className="h-4 w-4" /> Generate Declaration
            </button>

            {full.resume.declaration && (
              <div className="ai-current-highlight-indigo">
                <p className="ai-current-label-indigo">Current Declaration</p>
                <p className="ai-current-text">{full.resume.declaration}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={() => navigate(`/resumes/${resumeId}/templates`)} variant="secondary" className="gap-2">
          Next: Choose Template <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
