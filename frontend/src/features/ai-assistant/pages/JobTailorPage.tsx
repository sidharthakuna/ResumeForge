import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Zap,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Target,
  Briefcase,
  FolderGit2,
  Plus,
  Send,
} from 'lucide-react'
import { useDashboardResumes, useInvalidateDashboard } from '@/features/dashboard/api/useDashboardResumes'
import { useAnalyzeJob, useTailorResume } from '@/features/ai-assistant/hooks/useAiAssistant'
import { useUpdateResume } from '@/features/resume-editor/hooks/useResume'
import { useAddSkill } from '@/features/skills/api/skill.hooks'
import { AiSubNav } from '@/features/ai-assistant/components/AiSubNav'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { toast } from 'sonner'
import type { JobAnalysisResponse, ResumeTailoringResponse } from '@/types/api'
import '@/features/ai-assistant/styles/jobTailor.css'

const PRESET_JOBS = [
  {
    title: 'Senior Backend Engineer',
    desc: 'Seeking a Senior Backend Engineer proficient in Java, Spring Boot, REST APIs, Microservices, PostgreSQL, Docker, Kubernetes, and AWS. Responsible for building scalable high-throughput services, architecting database schemas, and optimizing latency.',
  },
  {
    title: 'Full Stack Software Engineer',
    desc: 'Looking for a Full Stack Engineer experienced with React, TypeScript, Node.js, Spring Boot, PostgreSQL, Docker, and CI/CD pipelines. Must be adept at creating intuitive user interfaces and resilient backend microservices.',
  },
  {
    title: 'Cloud & DevOps Architect',
    desc: 'We need a DevOps / Cloud Architect skilled in AWS, Kubernetes, Terraform, Docker, CI/CD automation, Prometheus monitoring, and Linux systems administration to lead infrastructure scalability and security.',
  },
]

export default function JobTailorPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: resumes, isLoading } = useDashboardResumes()
  const invalidate = useInvalidateDashboard()

  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')

  const [analysisResult, setAnalysisResult] = useState<JobAnalysisResponse | null>(null)
  const [tailoringResult, setTailoringResult] = useState<ResumeTailoringResponse | null>(null)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set())
  const [appliedSummary, setAppliedSummary] = useState(false)

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

  // Auto populate job title and default description when selecting a resume
  useEffect(() => {
    if (selectedResume) {
      const initialTitle = selectedResume.full.personalInfo?.jobTitle || selectedResume.full.resume.title || 'Senior Software Engineer'
      if (!jobTitle) {
        setJobTitle(initialTitle)
      }
      if (!jobDescription) {
        setJobDescription(
          `Seeking an experienced ${initialTitle} proficient in modern tech stacks, distributed systems, clean architecture, automated testing, and agile team collaboration.`
        )
      }
    }
  }, [selectedResume])

  const analyzeJobMutation = useAnalyzeJob(selectedResumeId)
  const tailorMutation = useTailorResume(selectedResumeId)
  const updateResumeMutation = useUpdateResume(selectedResumeId)
  const addSkillMutation = useAddSkill(selectedResumeId)

  const handleAnalyzeJob = async () => {
    if (!selectedResumeId || !jobTitle.trim() || !jobDescription.trim()) {
      toast.error('Please enter both Job Title and Job Description')
      return
    }

    try {
      const res = await analyzeJobMutation.mutateAsync({
        targetJobTitle: jobTitle.trim(),
        targetJobDescription: jobDescription.trim(),
      })
      setAnalysisResult(res)
      toast.success('Job Requirements Analyzed Successfully!')
    } catch {
      // Handled in mutation
    }
  }

  const handleAutoTailor = async () => {
    if (!selectedResumeId || !jobTitle.trim() || !jobDescription.trim()) {
      toast.error('Please provide Job Title and Description to tailor')
      return
    }

    try {
      const res = await tailorMutation.mutateAsync({
        targetJobTitle: jobTitle.trim(),
        targetJobDescription: jobDescription.trim(),
      })
      setTailoringResult(res)
      setAppliedSummary(false)
      invalidate()
      toast.success('Generated Tailored Content for your resume!')
    } catch {
      // Handled in mutation
    }
  }

  const handleApplySummary = async (summaryText: string) => {
    if (!selectedResumeId || !summaryText) return
    try {
      await updateResumeMutation.mutateAsync({
        summary: summaryText,
      })
      setAppliedSummary(true)
      invalidate()
      toast.success('Tailored summary applied to your resume!')
    } catch {
      toast.error('Failed to apply summary')
    }
  }

  const handleQuickAddSkill = async (skillName: string) => {
    if (!selectedResumeId || addedSkills.has(skillName)) return
    try {
      await addSkillMutation.mutateAsync({
        name: skillName,
      })
      setAddedSkills((prev) => new Set(prev).add(skillName))
      invalidate()
      toast.success(`Added ${skillName} to active resume!`)
    } catch {
      toast.error(`Failed to add ${skillName}`)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(id)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const applyPreset = (preset: typeof PRESET_JOBS[0]) => {
    setJobTitle(preset.title)
    setJobDescription(preset.desc)
    toast.info(`Loaded preset for ${preset.title}`)
  }

  if (isLoading) return <FullPageSpinner label="Loading Job Tailor system…" />

  if (!resumes || resumes.length === 0) {
    return (
      <div className="tailor-container text-center py-16">
        <Zap className="mx-auto h-12 w-12 text-indigo-500 mb-3" />
        <h2 className="text-xl font-bold text-ink-900">No Resumes Found</h2>
        <p className="text-xs text-ink-500 mt-1">Create a resume to tailor it to target jobs.</p>
        <Button onClick={() => navigate('/dashboard?create=1')} className="mt-4 gap-2">
          <Sparkles className="h-4 w-4" /> Create Resume
        </Button>
      </div>
    )
  }

  return (
    <div className="tailor-container space-y-6">
      {/* Subsystem Navigation Bar */}
      <AiSubNav currentResumeId={selectedResumeId} />

      {/* Header Banner */}
      <div className="tailor-header-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
                  Target Job Tailoring Engine
                </h1>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 text-[10px] font-extrabold text-indigo-800 dark:text-indigo-300">
                  Precision Match
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-600 dark:text-slate-300">
                Paste any job description to align your professional summary, highlight required competencies, and generate matching bullet points.
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
                setAnalysisResult(null)
                setTailoringResult(null)
              }}
              className="rounded-xl border border-ink-200 bg-paper-50 px-3 py-1.5 text-xs font-bold text-ink-900 shadow-2xs focus:border-indigo-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
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

      {/* Target Job Input Box */}
      <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400">
            Paste Job Specification & Requirements
          </h3>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-400 font-medium mr-1">Presets:</span>
            {PRESET_JOBS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-lg border border-ink-200 bg-paper-100/70 px-2 py-0.5 text-[11px] font-semibold text-ink-700 hover:border-indigo-500 hover:text-indigo-700 hover:bg-indigo-50/60 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {p.title.split(' ')[0]} {p.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-semibold text-ink-600 mb-1">
              Target Job Title *
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              className="w-full rounded-xl border border-ink-200 bg-paper-100/50 px-3 py-2 text-xs text-ink-900 focus:border-indigo-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800 font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-ink-600 mb-1">
              Job Description / Responsibilities / Tech Stack *
            </label>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the recruiter's job description snippet..."
              className="w-full rounded-xl border border-ink-200 bg-paper-100/50 px-3 py-2 text-xs text-ink-900 focus:border-indigo-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between border-t border-ink-100/80 pt-3 gap-2">
          <span className="text-[11px] text-ink-500">
            Powered by Gemini AI Semantic Parser
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleAnalyzeJob}
              loading={analyzeJobMutation.isPending}
              className="text-xs h-9 px-3.5"
            >
              <Target className="h-3.5 w-3.5 mr-1" />
              <span>Analyze Alignment</span>
            </Button>

            <Button
              variant="primary"
              onClick={handleAutoTailor}
              loading={tailorMutation.isPending}
              className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs h-9 px-4 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Tailored Content</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && !tailoringResult && (
        <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-ink-100/80 pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-ink-900">Job Alignment Breakdown</h3>
            </div>
            <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              {analysisResult.matchScore}% Match
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">
                Matched In Your Resume ({analysisResult.keywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.keywords.map((kw, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <Check className="h-3 w-3" /> {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">
                Missing Job Requirements ({analysisResult.missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.missingSkills.map((sk, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tailoring Full Output */}
      {tailoringResult && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Section 1: Tailored Summary */}
          <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80 space-y-3">
            <div className="flex items-center justify-between border-b border-ink-100/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h4 className="text-sm font-bold text-ink-900">Tailored Professional Summary Pitch</h4>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(tailoringResult.summary, 'summary')}
                  className="text-xs h-7 gap-1"
                >
                  {copiedSection === 'summary' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedSection === 'summary' ? 'Copied' : 'Copy'}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleApplySummary(tailoringResult.summary)}
                  disabled={appliedSummary}
                  className={`text-xs h-7 gap-1 ${
                    appliedSummary ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {appliedSummary ? <Check className="h-3 w-3" /> : <Send className="h-3 w-3" />}
                  <span>{appliedSummary ? 'Applied to Resume' : 'Apply to Resume'}</span>
                </Button>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-ink-700 dark:text-slate-200 bg-paper-100/60 p-3.5 rounded-xl border border-ink-100/80 font-normal">
              {tailoringResult.summary}
            </p>
          </div>

          {/* Section 2: Tailored Experience Bullets */}
          {tailoringResult.experience && tailoringResult.experience.length > 0 && (
            <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80 space-y-4">
              <div className="flex items-center justify-between border-b border-ink-100/80 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-ink-900">Tailored Experience Bullet Points</h4>
                </div>
                <span className="text-[10px] text-ink-400">Enriched with metrics & target keywords</span>
              </div>

              <div className="space-y-3">
                {tailoringResult.experience.map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-ink-100 bg-paper-100/40 p-3.5 space-y-2 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink-900">
                        {exp.jobTitle} <span className="font-normal text-ink-500">at</span> {exp.company}
                      </p>
                      <button
                        onClick={() => handleCopy(exp.bullets.join('\n• '), `exp-${idx}`)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === `exp-${idx}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>Copy Bullets</span>
                      </button>
                    </div>

                    <ul className="space-y-1.5 text-xs text-ink-700 dark:text-slate-300">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Tailored Projects */}
          {tailoringResult.projects && tailoringResult.projects.length > 0 && (
            <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80 space-y-4">
              <div className="flex items-center justify-between border-b border-ink-100/80 pb-3">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-ink-900">Tailored Project Highlights</h4>
                </div>
                <span className="text-[10px] text-ink-400">Technical depth & architectural outcomes</span>
              </div>

              <div className="space-y-3">
                {tailoringResult.projects.map((proj, idx) => (
                  <div key={idx} className="rounded-xl border border-ink-100 bg-paper-100/40 p-3.5 space-y-2 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink-900">{proj.title}</p>
                      <button
                        onClick={() => handleCopy(proj.bullets.join('\n• '), `proj-${idx}`)}
                        className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === `proj-${idx}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>Copy Bullets</span>
                      </button>
                    </div>

                    <ul className="space-y-1.5 text-xs text-ink-700 dark:text-slate-300">
                      {proj.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Recommended Missing Keywords with 1-click Add */}
          {tailoringResult.missingSkills && tailoringResult.missingSkills.length > 0 && (
            <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80">
              <div className="flex items-center justify-between border-b border-ink-100/80 pb-3">
                <h4 className="text-xs font-bold text-ink-900">Add Missing High-Demand Skills</h4>
                <span className="text-[10px] text-ink-400">1-click addition to resume</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {tailoringResult.missingSkills.map((sk, i) => {
                  const isAdded = addedSkills.has(sk)
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuickAddSkill(sk)}
                      disabled={isAdded}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                        isAdded
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-paper-100 border-ink-200 text-ink-700 hover:border-indigo-500 hover:text-indigo-700 cursor-pointer dark:bg-slate-900'
                      }`}
                    >
                      {isAdded ? <Check className="h-3 w-3 text-emerald-600" /> : <Plus className="h-3 w-3 text-indigo-600" />}
                      <span>{sk}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/resumes/${selectedResumeId}/export`)}
              className="text-xs gap-1.5"
            >
              <span>Export PDF</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/resumes/${selectedResumeId}/edit/personal`)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              <span>Review in Editor</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
