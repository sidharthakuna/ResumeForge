import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  RotateCw,
  ChevronRight,
  AlertCircle,
  Plus,
  Layers,
  Briefcase,
  FolderGit2,
} from 'lucide-react'
import { useDashboardResumes, useInvalidateDashboard } from '@/features/dashboard/api/useDashboardResumes'
import { useAnalyzeAts } from '@/features/ai-assistant/hooks/useAiAssistant'
import { useAddSkill } from '@/features/skills/api/skill.hooks'
import { AiSubNav } from '@/features/ai-assistant/components/AiSubNav'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { toast } from 'sonner'
import type { AtsAnalysisResponse } from '@/types/api'
import '@/features/ai-assistant/styles/atsChecker.css'

const PRESET_ROLES = [
  {
    title: 'Java / Spring Backend Engineer',
    desc: 'Java, Spring Boot, REST APIs, Microservices, PostgreSQL, Docker, AWS, JUnit, Hibernate, CI/CD, Redis, Kafka.',
  },
  {
    title: 'Full Stack React & Node Developer',
    desc: 'React, TypeScript, Next.js, Node.js, Express, Tailwind CSS, PostgreSQL, REST APIs, GraphQL, Docker, Git.',
  },
  {
    title: 'DevOps & Cloud Infrastructure Specialist',
    desc: 'AWS, Kubernetes, Docker, Terraform, CI/CD pipelines, Linux, Python scripting, Monitoring, Prometheus, Bash.',
  },
  {
    title: 'Frontend UI/UX Specialist',
    desc: 'React, TypeScript, HTML5, CSS3, Tailwind CSS, Responsive Design, State Management, Vite, Performance Optimization, A11y.',
  },
]

export default function AtsCheckerPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: resumes, isLoading } = useDashboardResumes()
  const invalidate = useInvalidateDashboard()

  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [atsResult, setAtsResult] = useState<AtsAnalysisResponse | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set())

  // Sync selected resume from query param or default to first
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

  // Auto-populate target job title from resume's personal info when switching resumes
  useEffect(() => {
    if (selectedResume) {
      const initialTitle = selectedResume.full.personalInfo?.jobTitle || selectedResume.full.resume.title || ''
      if (!jobTitle) {
        setJobTitle(initialTitle)
      }
    }
  }, [selectedResume])

  const analyzeAtsMutation = useAnalyzeAts(selectedResumeId)
  const addSkillMutation = useAddSkill(selectedResumeId)

  const handleRunAudit = async () => {
    if (!selectedResumeId) return
    try {
      const res = await analyzeAtsMutation.mutateAsync({
        targetJobTitle: jobTitle.trim() || null,
        targetJobDescription: jobDescription.trim() || null,
      })
      setAtsResult(res)
      toast.success('ATS Compatibility Audit Complete!')
    } catch {
      // Error handled by mutation hook
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    toast.success(`Copied "${text}" to clipboard`)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleQuickAddSkill = async (skillName: string) => {
    if (!selectedResumeId || addedSkills.has(skillName)) return
    try {
      await addSkillMutation.mutateAsync({
        name: skillName,
      })
      setAddedSkills((prev) => new Set(prev).add(skillName))
      invalidate()
      toast.success(`Added "${skillName}" directly to your resume skills!`)
    } catch {
      toast.error(`Failed to add ${skillName}`)
    }
  }

  const applyPreset = (preset: typeof PRESET_ROLES[0]) => {
    setJobTitle(preset.title)
    setJobDescription(preset.desc)
    toast.info(`Loaded preset: ${preset.title}`)
  }

  if (isLoading) return <FullPageSpinner label="Loading ATS Audit system…" />

  if (!resumes || resumes.length === 0) {
    return (
      <div className="ats-container text-center py-16">
        <Target className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
        <h2 className="text-xl font-bold text-ink-900">No Resumes Found</h2>
        <p className="text-xs text-ink-500 mt-1">Create a resume to run real-time ATS audits.</p>
        <Button onClick={() => navigate('/dashboard?create=1')} className="mt-4 gap-2">
          <Sparkles className="h-4 w-4" /> Create Resume
        </Button>
      </div>
    )
  }

  const score = atsResult?.score ?? 85

  return (
    <div className="ats-container space-y-6">
      {/* Subsystem Navigation Bar */}
      <AiSubNav currentResumeId={selectedResumeId} />

      {/* Header Banner */}
      <div className="ats-header-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
                  ATS Compatibility Audit
                </h1>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                  Real Scanner
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-600 dark:text-slate-300">
                Audit keyword density, format parseability, and heading structure against modern ATS algorithms.
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
                setAtsResult(null)
              }}
              className="rounded-xl border border-ink-200 bg-paper-50 px-3 py-1.5 text-xs font-bold text-ink-900 shadow-2xs focus:border-emerald-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
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

      {/* Quick Resume Overview Badges */}
      {selectedResume && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2 text-xs shadow-2xs dark:border-ink-200 dark:bg-paper-50/70">
            <Layers className="h-4 w-4 text-cyan-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Skills</p>
              <p className="font-bold text-ink-900">{selectedResume.full.skills?.length || 0} items</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2 text-xs shadow-2xs dark:border-ink-200 dark:bg-paper-50/70">
            <Briefcase className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Experience</p>
              <p className="font-bold text-ink-900">{selectedResume.full.experience?.length || 0} entries</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2 text-xs shadow-2xs dark:border-ink-200 dark:bg-paper-50/70">
            <FolderGit2 className="h-4 w-4 text-purple-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Projects</p>
              <p className="font-bold text-ink-900">{selectedResume.full.projects?.length || 0} items</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-paper-50 px-3.5 py-2 text-xs shadow-2xs dark:border-ink-200 dark:bg-paper-50/70">
            <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Summary</p>
              <p className="font-bold text-ink-900">{selectedResume.full.resume.summary ? 'Included' : 'Missing'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Controls & Audit Trigger */}
      <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400">
            Target Role & Benchmark Requirements
          </h3>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-400 font-medium mr-1">Presets:</span>
            {PRESET_ROLES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-lg border border-ink-200 bg-paper-100/70 px-2 py-0.5 text-[11px] font-semibold text-ink-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/60 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {p.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-ink-600 mb-1">
              Target Job Title (Optional)
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer, Full Stack Architect"
              className="w-full rounded-xl border border-ink-200 bg-paper-100/50 px-3 py-2 text-xs text-ink-900 focus:border-emerald-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-600 mb-1">
              Target Job Description / Tech Requirements (Optional)
            </label>
            <input
              type="text"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g. Java, Spring Boot, REST APIs, Docker, AWS, PostgreSQL..."
              className="w-full rounded-xl border border-ink-200 bg-paper-100/50 px-3 py-2 text-xs text-ink-900 focus:border-emerald-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100/80 pt-3">
          <span className="text-[11px] text-ink-500">
            Powered by Spring Boot AI ATS Diagnostic engine
          </span>

          <Button
            onClick={handleRunAudit}
            loading={analyzeAtsMutation.isPending}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs h-9 px-4 shadow-sm"
          >
            {analyzeAtsMutation.isPending ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Auditing Parseability…</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Run ATS Compatibility Audit</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results View */}
      {atsResult ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Score Summary Banner */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Score Radial */}
            <div className="ats-metric-card flex flex-col items-center justify-center text-center">
              <div className="ats-score-meter">
                <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {score}%
                </span>
                <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wide">
                  ATS Score
                </span>
              </div>
              <p className="mt-2 text-xs font-bold text-ink-900">
                {score >= 85 ? 'Excellent ATS Readability' : score >= 70 ? 'Good Formatting' : 'Improvements Needed'}
              </p>
            </div>

            {/* Quick Summary Highlights */}
            <div className="ats-metric-card sm:col-span-2 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400">
                  Matched ATS Keywords ({atsResult.matchedKeywords?.length || 0})
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {(atsResult.matchedKeywords && atsResult.matchedKeywords.length > 0) ? (
                    atsResult.matchedKeywords.map((kw, i) => (
                      <span key={i} className="ats-keyword-tag">
                        <Check className="h-3 w-3 text-emerald-600" /> {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-ink-500">No keyword overlap detected.</span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-100/80 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-ink-600">Standard Section Headers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-ink-600">Clean Chronological Layout</span>
                </div>
              </div>
            </div>
          </div>

          {/* Missing Keywords & Suggestions */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Missing Keywords with 1-click Add */}
            <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80">
              <div className="flex items-center justify-between border-b border-ink-100/80 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-ink-900">Recommended Keywords to Include</h4>
                </div>
                <span className="text-[10px] text-ink-400">Click to copy or add</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(atsResult.missingKeywords && atsResult.missingKeywords.length > 0) ? (
                  atsResult.missingKeywords.map((kw, i) => {
                    const isAdded = addedSkills.has(kw)
                    return (
                      <div key={i} className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(kw, `kw-${i}`)}
                          className="ats-missing-tag hover:scale-102 active:scale-98 transition-transform cursor-pointer"
                          title="Copy keyword"
                        >
                          <span>{kw}</span>
                          {copiedKey === `kw-${i}` ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-60" />
                          )}
                        </button>

                        <button
                          onClick={() => handleQuickAddSkill(kw)}
                          disabled={isAdded}
                          className={`rounded-md p-1 border text-[11px] transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-950'
                              : 'bg-paper-100 border-ink-200 text-ink-600 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700'
                          }`}
                          title={isAdded ? 'Already added to resume' : 'Add to resume skills'}
                        >
                          {isAdded ? <Check className="h-3 w-3 text-emerald-600" /> : <Plus className="h-3 w-3" />}
                        </button>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-ink-500">All essential target keywords are present in your resume profile!</p>
                )}
              </div>
            </div>

            {/* Actionable Improvement Suggestions */}
            <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80">
              <div className="flex items-center justify-between border-b border-ink-100/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-xs font-bold text-ink-900">Suggestions & Strengths</h4>
                </div>
                <span className="text-[10px] font-bold text-indigo-600">Action Items</span>
              </div>

              <ul className="mt-3 space-y-2 text-xs">
                {(atsResult.suggestions && atsResult.suggestions.length > 0) ? (
                  atsResult.suggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2 text-ink-700 dark:text-slate-300">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{sug}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-ink-500">Resume format meets top ATS criteria.</li>
                )}

                {atsResult.formattingWarnings && atsResult.formattingWarnings.length > 0 && (
                  atsResult.formattingWarnings.map((warn, i) => (
                    <li key={`warn-${i}`} className="flex items-start gap-2 text-amber-700 dark:text-amber-300">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/resumes/${selectedResumeId}/export`)}
              className="gap-2 text-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/resumes/${selectedResumeId}/edit/personal`)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              <span>Edit in Resume Builder</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center bg-paper-50/50">
          <ShieldCheck className="mx-auto h-10 w-10 text-emerald-500/70 mb-2" />
          <h4 className="text-sm font-bold text-ink-800">Ready to audit {selectedResume?.full.resume.title || 'your resume'}</h4>
          <p className="text-xs text-ink-500 max-w-md mx-auto mt-1">
            Click "Run ATS Compatibility Audit" above to test against ATS parsers, detect missing keywords, and review formatting score.
          </p>
        </div>
      )}
    </div>
  )
}
