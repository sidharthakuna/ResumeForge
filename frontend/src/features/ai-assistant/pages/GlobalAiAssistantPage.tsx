import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import {
  Bot,
  Sparkles,
  FileText,
  CheckCircle2,
  ChevronRight,
  Wand2,
  Target,
  BarChart2,
  Layers,
  Briefcase,
  FolderGit2,
} from 'lucide-react'
import { useDashboardResumes, useInvalidateDashboard } from '@/features/dashboard/api/useDashboardResumes'
import { useGenerateDeclaration, useUpdateResume } from '@/features/resume-editor/hooks/useResume'
import {
  useAnalyzeJob,
  usePreviewSummary,
  useAnalyzeAts,
  useTailorResume,
} from '@/features/ai-assistant/hooks/useAiAssistant'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { JobMatchBadgeList } from '@/features/ai-assistant/components/JobMatchBadgeList'
import { AtsScoreMeter } from '@/features/ai-assistant/components/AtsScoreMeter'
import { AiPreviewBox } from '@/features/ai-assistant/components/AiPreviewBox'
import { toast } from 'sonner'
import type {
  JobAnalysisResponse,
  AiSummaryPreviewResponse,
  AtsAnalysisResponse,
  ResumeTailoringResponse,
} from '@/types/api'

export default function GlobalAiAssistantPage() {
  const navigate = useNavigate()
  const { resumeId: pathResumeId } = useParams<{ resumeId?: string }>()
  const [params] = useSearchParams()
  const { data: resumes, isLoading } = useDashboardResumes()
  const invalidate = useInvalidateDashboard()

  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [city, setCity] = useState('')

  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisResponse | null>(null)
  const [summaryPreview, setSummaryPreview] = useState<AiSummaryPreviewResponse | null>(null)
  const [atsAnalysis, setAtsAnalysis] = useState<AtsAnalysisResponse | null>(null)
  const [tailoringResult, setTailoringResult] = useState<ResumeTailoringResponse | null>(null)

  // Set initial selected resume
  useEffect(() => {
    if (resumes && resumes.length > 0) {
      const targetId = pathResumeId || params.get('resumeId')
      if (targetId && resumes.some((r) => r.full.resume.id === targetId)) {
        setSelectedResumeId(targetId)
      } else if (!selectedResumeId) {
        setSelectedResumeId(resumes[0].full.resume.id)
      }
    }
  }, [resumes, pathResumeId, params, selectedResumeId])

  const selectedResume = resumes?.find((r) => r.full.resume.id === selectedResumeId)

  const updateResume = useUpdateResume(selectedResumeId)
  const generateDeclaration = useGenerateDeclaration(selectedResumeId)
  const analyzeJobMutation = useAnalyzeJob(selectedResumeId)
  const previewSummaryMutation = usePreviewSummary(selectedResumeId)
  const atsAnalysisMutation = useAnalyzeAts(selectedResumeId)
  const tailorResumeMutation = useTailorResume(selectedResumeId)

  if (isLoading) {
    return <FullPageSpinner />
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-8 ring-purple-500/5">
          <Bot className="h-8 w-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-ink-900">AI Resume Workspace</h2>
        <p className="mt-2 text-sm text-ink-500">
          You don't have any resumes yet. Create your first resume to unlock job-tailored summaries, experience bullets, and ATS optimization.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/dashboard?create=1')} className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600">
            <Sparkles className="h-4 w-4" /> Create Your First Resume
          </Button>
        </div>
      </div>
    )
  }

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
    } catch {}
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
    } catch {}
  }

  const handleRunAtsCheck = async () => {
    try {
      const res = await atsAnalysisMutation.mutateAsync({
        targetJobTitle: jobTitle || null,
        targetJobDescription: jobDescription || null,
      })
      if (res) {
        setAtsAnalysis(res)
        toast.success('ATS analysis completed!')
      }
    } catch {}
  }

  const handleTailorFullResume = async () => {
    try {
      const res = await tailorResumeMutation.mutateAsync({
        targetJobTitle: jobTitle || null,
        targetJobDescription: jobDescription || null,
      })
      if (res) {
        setTailoringResult(res)
        if (res.atsAnalysis) setAtsAnalysis(res.atsAnalysis)
        toast.success('Complete resume tailoring generated!')
      }
    } catch {}
  }

  const handleApplySummary = (content: string | string[]) => {
    const text = Array.isArray(content) ? content.join(' ') : content
    updateResume.mutate(
      {
        title: selectedResume?.full.resume.title || null,
        summary: text,
        declaration: selectedResume?.full.resume.declaration || null,
      },
      {
        onSuccess: () => {
          invalidate()
          toast.success('Summary applied to resume!')
        },
      }
    )
  }

  return (
    <div className="ai-workspace-container">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="ai-header-icon-box">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="ai-page-title">AI Resume Workspace</h1>
              <Badge tone="purple" className="text-[10px] tracking-wider uppercase font-bold">Smart Synthesis</Badge>
            </div>
            <p className="ai-page-subtitle">
              Align your resume with recruiter requirements using strict factual grounding.
            </p>
          </div>
        </div>

        {/* Resume Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-600 dark:text-ink-300 whitespace-nowrap">Target Resume:</span>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="ai-target-select"
          >
            {resumes.map((r) => (
              <option key={r.full.resume.id} value={r.full.resume.id}>
                {r.full.resume.title || 'Untitled Resume'} {r.full.personalInfo ? `(${r.full.personalInfo.fullName || 'No Name'})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {/* Targeting & Recruiter JD Card */}
        <div className="ai-card">
          <div className="ai-card-header">
            <div className="flex items-center gap-2.5">
              <div className="ai-card-header-icon">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <h3 className="ai-card-title">Recruiter Job Description &amp; Targeting</h3>
                <p className="ai-card-desc">Paste job requirements to run instant semantic matching &amp; tailoring.</p>
              </div>
            </div>
          </div>
          <div className="ai-card-body space-y-4">
            <div>
              <label htmlFor="globalJobTitle" className="ai-label">
                Target Job Title <span className="ai-label-sub">(optional)</span>
              </label>
              <input
                id="globalJobTitle"
                placeholder="e.g. Senior Java Backend Engineer, Full Stack Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="ai-input mt-1"
              />
            </div>

            <div>
              <label htmlFor="globalJobDesc" className="ai-label">
                Recruiter Job Description <span className="ai-label-sub">(optional)</span>
              </label>
              <textarea
                id="globalJobDesc"
                rows={5}
                placeholder="Paste the job description or required skills here to extract matching keywords, missing competencies, and tailored bullets..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="ai-textarea mt-1 resize-y"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
              <div className="flex flex-wrap items-center gap-2">
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
                  <BarChart2 className="h-3.5 w-3.5" /> ATS Audit
                </button>
              </div>

              <button
                type="button"
                onClick={handleTailorFullResume}
                disabled={tailorResumeMutation.isPending}
                className="ai-btn-primary"
              >
                <Wand2 className="h-4 w-4" /> Generate Full Resume Tailoring
              </button>
            </div>

            {jobAnalysis && (
              <div className="ai-signals-panel">
                <div className="ai-signals-header">
                  <p className="ai-signals-title">
                    JD Match Signals ({jobAnalysis.jobTitle})
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
          </div>
        </div>

        {/* Full Tailoring Results */}
        {tailoringResult && (
          <div className="ai-card-purple shadow-md">
            <div className="ai-card-header">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="ai-card-title">
                  Comprehensive Resume Tailoring Results
                </h3>
              </div>
              <Badge tone="purple">Ready to Review</Badge>
            </div>
            <div className="ai-card-body space-y-6">
              {/* Summary */}
              <div>
                <p className="ai-section-label-purple mb-2">
                  <FileText className="h-4 w-4 shrink-0 text-purple-800 dark:text-purple-300" /> Tailored Summary
                </p>
                <AiPreviewBox
                  title="Tailored Professional Summary"
                  content={tailoringResult.summary}
                  matchedSkills={tailoringResult.matchedSkills}
                  onApply={handleApplySummary}
                  isApplying={updateResume.isPending}
                />
              </div>

              {/* Experience Bullets */}
              {tailoringResult.experience && tailoringResult.experience.length > 0 && (
                <div className="space-y-3">
                  <p className="ai-section-label-purple">
                    <Briefcase className="h-4 w-4 shrink-0 text-purple-800 dark:text-purple-300" /> Tailored Experience Bullets
                  </p>
                  {tailoringResult.experience.map((exp, idx) => (
                    <div key={idx} className="ai-nested-card">
                      <p className="ai-nested-title">
                        {exp.jobTitle} at {exp.company}
                      </p>
                      <ul className="mt-2.5 space-y-1.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="ai-bullet-item">
                            <span className="ai-bullet-dot">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {tailoringResult.projects && tailoringResult.projects.length > 0 && (
                <div className="space-y-3">
                  <p className="ai-section-label-purple">
                    <FolderGit2 className="h-4 w-4 shrink-0 text-purple-800 dark:text-purple-300" /> Tailored Project Highlights
                  </p>
                  {tailoringResult.projects.map((proj, idx) => (
                    <div key={idx} className="ai-nested-card">
                      <p className="ai-nested-title">
                        {proj.title}
                      </p>
                      <ul className="mt-2.5 space-y-1.5">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="ai-bullet-item">
                            <span className="ai-bullet-dot">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Prioritized Skills */}
              {tailoringResult.prioritizedSkills && tailoringResult.prioritizedSkills.length > 0 && (
                <div className="ai-prioritized-box space-y-2.5">
                  <p className="ai-section-label-cyan">
                    <Layers className="h-4 w-4 shrink-0 text-cyan-900 dark:text-cyan-300" /> Prioritized Skills for this Role
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tailoringResult.prioritizedSkills.map((s, idx) => (
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
        )}

        {/* Summary Quick Generator Card */}
        <div className="ai-card">
          <div className="ai-card-header">
            <div className="flex items-center gap-2.5">
              <div className="ai-card-header-icon">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="ai-card-title">Professional Summary Generator</h3>
                <p className="ai-card-desc">Generates a concise 2–4 sentence tailored executive summary.</p>
              </div>
            </div>
            {selectedResume?.full.resume.summary && (
              <Badge tone="emerald" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Active on Resume
              </Badge>
            )}
          </div>
          <div className="ai-card-body space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={previewSummaryMutation.isPending}
                className="ai-btn-primary"
              >
                <Wand2 className="h-4 w-4" /> Generate &amp; Preview Summary
              </button>

              {selectedResumeId && (
                <Link
                  to={`/resumes/${selectedResumeId}/edit/summary`}
                  className="ai-nav-link"
                >
                  Edit in Resume Editor <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {summaryPreview && (
              <div className="mt-4">
                <AiPreviewBox
                  title="Tailored Summary Preview"
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

            {selectedResume?.full.resume.summary && (
              <div className="ai-current-highlight-purple">
                <p className="ai-current-label-purple">
                  Current Summary on Resume
                </p>
                <p className="ai-current-text">
                  {selectedResume.full.resume.summary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Declaration Card */}
        <div className="ai-card">
          <div className="ai-card-header">
            <div className="flex items-center gap-2.5">
              <div className="ai-card-header-icon">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="ai-card-title">Declaration Statement Generator</h3>
                <p className="ai-card-desc">Generates formal declaration statement with your city &amp; details.</p>
              </div>
            </div>
            {selectedResume?.full.resume.declaration && (
              <Badge tone="emerald" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Active on Resume
              </Badge>
            )}
          </div>
          <div className="ai-card-body space-y-4">
            <div>
              <label htmlFor="globalCity" className="ai-label">
                Your City / Location <span className="ai-label-sub">(for declaration line)</span>
              </label>
              <input
                id="globalCity"
                placeholder="e.g. Hyderabad, Bengaluru, San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="ai-input mt-1"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  generateDeclaration.mutate(
                    { city: city || null },
                    {
                      onSuccess: () => {
                        invalidate()
                        toast.success('Declaration generated and saved to resume!')
                      },
                    }
                  )
                }}
                disabled={generateDeclaration.isPending}
                className="ai-btn-primary"
              >
                <Sparkles className="h-4 w-4" /> Generate Declaration
              </button>
            </div>

            {selectedResume?.full.resume.declaration && (
              <div className="ai-current-highlight-indigo">
                <p className="ai-current-label-indigo">
                  Current Declaration on Resume
                </p>
                <p className="ai-current-text">
                  {selectedResume.full.resume.declaration}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
