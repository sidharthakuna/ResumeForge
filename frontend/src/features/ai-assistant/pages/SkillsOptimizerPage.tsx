import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Layers,
  Sparkles,
  Check,
  TrendingUp,
  Cpu,
  Plus,
  ChevronRight,
  RotateCw,
  Zap,
} from 'lucide-react'
import { useDashboardResumes, useInvalidateDashboard } from '@/features/dashboard/api/useDashboardResumes'
import { usePrioritizeSkills } from '@/features/ai-assistant/hooks/useAiAssistant'
import { useAddSkill } from '@/features/skills/api/skill.hooks'
import { AiSubNav } from '@/features/ai-assistant/components/AiSubNav'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { toast } from 'sonner'
import type { SkillPrioritizationResponse } from '@/types/api'
import '@/features/ai-assistant/styles/skillsOptimizer.css'

const PRESET_STACKS = [
  {
    title: 'Java & Microservices Backend',
    skills: 'Java, Spring Boot, REST APIs, Microservices, PostgreSQL, Docker, AWS, JUnit, Hibernate, Kafka, Redis',
  },
  {
    title: 'Full Stack Modern Web',
    skills: 'React, TypeScript, Next.js, Node.js, Express, Tailwind CSS, PostgreSQL, GraphQL, Docker, Git',
  },
  {
    title: 'Cloud DevOps & Site Reliability',
    skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD pipelines, Prometheus, Linux, Bash, Python, Helm',
  },
  {
    title: 'Mobile App Developer',
    skills: 'Flutter, Dart, React Native, TypeScript, iOS, Android, REST APIs, Firebase, State Management',
  },
]

export default function SkillsOptimizerPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: resumes, isLoading } = useDashboardResumes()
  const invalidate = useInvalidateDashboard()

  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<SkillPrioritizationResponse | null>(null)
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set())

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

  // Auto populate target title and existing skills benchmark
  useEffect(() => {
    if (selectedResume) {
      const title = selectedResume.full.personalInfo?.jobTitle || selectedResume.full.resume.title || 'Software Engineer'
      if (!jobTitle) {
        setJobTitle(title)
      }
      if (!jobDescription && selectedResume.full.skills && selectedResume.full.skills.length > 0) {
        setJobDescription(selectedResume.full.skills.map((s) => s.name).join(', '))
      }
    }
  }, [selectedResume])

  const prioritizeMutation = usePrioritizeSkills(selectedResumeId)
  const addSkillMutation = useAddSkill(selectedResumeId)

  const handlePrioritize = async () => {
    if (!selectedResumeId || !jobTitle.trim()) {
      toast.error('Please specify a target role or skills list')
      return
    }

    try {
      const res = await prioritizeMutation.mutateAsync({
        targetJobTitle: jobTitle.trim(),
        targetJobDescription: jobDescription.trim() || null,
      })
      setResult(res)
      invalidate()
      toast.success('Skills prioritized and re-ordered for maximum ATS visibility!')
    } catch {
      // Handled in mutation
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
      toast.success(`Added "${skillName}" to active resume skills!`)
    } catch {
      toast.error(`Failed to add ${skillName}`)
    }
  }

  const applyPreset = (preset: typeof PRESET_STACKS[0]) => {
    setJobTitle(preset.title)
    setJobDescription(preset.skills)
    toast.info(`Loaded preset: ${preset.title}`)
  }

  if (isLoading) return <FullPageSpinner label="Loading Skills Optimizer…" />

  if (!resumes || resumes.length === 0) {
    return (
      <div className="skills-container text-center py-16">
        <Layers className="mx-auto h-12 w-12 text-cyan-500 mb-3" />
        <h2 className="text-xl font-bold text-ink-900">No Resumes Found</h2>
        <p className="text-xs text-ink-500 mt-1">Create a resume to rank and prioritize skills.</p>
        <Button onClick={() => navigate('/dashboard?create=1')} className="mt-4 gap-2">
          <Sparkles className="h-4 w-4" /> Create Resume
        </Button>
      </div>
    )
  }

  const existingSkills = selectedResume?.full.skills || []

  return (
    <div className="skills-container space-y-6">
      {/* Subsystem Navigation Bar */}
      <AiSubNav currentResumeId={selectedResumeId} />

      {/* Header Banner */}
      <div className="skills-header-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-md">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
                  Skills Prioritizer & Matrix Optimizer
                </h1>
                <span className="rounded-full bg-cyan-100 dark:bg-cyan-950/80 px-2 py-0.5 text-[10px] font-extrabold text-cyan-800 dark:text-cyan-300">
                  ATS Ranker
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-600 dark:text-slate-300">
                Reorder your skills list to place critical role keywords at the top where recruiters and ATS parsers scan first.
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
                setResult(null)
              }}
              className="rounded-xl border border-ink-200 bg-paper-50 px-3 py-1.5 text-xs font-bold text-ink-900 shadow-2xs focus:border-cyan-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
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

      {/* Current Resume Skills Chips Bar */}
      <div className="rounded-2xl border border-ink-100 bg-paper-50 p-4 shadow-xs dark:border-ink-200 dark:bg-paper-50/80">
        <div className="flex items-center justify-between border-b border-ink-100/80 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-600" />
            <h4 className="text-xs font-bold text-ink-900">
              Current Skills on Resume ({existingSkills.length})
            </h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/resumes/${selectedResumeId}/edit/skills`)}
            className="text-xs h-7 gap-1"
          >
            <span>Edit Skills</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        {existingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {existingSkills.map((sk) => (
              <span
                key={sk.id}
                className="inline-flex items-center rounded-lg border border-ink-200 bg-paper-100/70 px-2.5 py-1 text-xs font-medium text-ink-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
              >
                {sk.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-500 py-1">
            No skills added to this resume yet. Add skills in the editor or use the recommendations below!
          </p>
        )}
      </div>

      {/* Inputs for Role Targeting */}
      <div className="rounded-2xl border border-ink-100 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400">
            Target Role & Stack Benchmark
          </h3>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-400 font-medium mr-1">Presets:</span>
            {PRESET_STACKS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-lg border border-ink-200 bg-paper-100/70 px-2 py-0.5 text-[11px] font-semibold text-ink-700 hover:border-cyan-500 hover:text-cyan-700 hover:bg-cyan-50/60 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {p.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-semibold text-ink-600 mb-1">
              Target Job Title *
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Backend Engineer, DevOps Specialist"
              className="w-full rounded-xl border border-ink-200 bg-paper-100/50 px-3 py-2 text-xs text-ink-900 focus:border-cyan-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-600 mb-1">
              Key Skills / Requirements Benchmark (Optional)
            </label>
            <input
              type="text"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g. Java, Spring Boot, Microservices, Docker, Kubernetes"
              className="w-full rounded-xl border border-ink-200 bg-paper-100/50 px-3 py-2 text-xs text-ink-900 focus:border-cyan-500 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100/80 pt-3">
          <span className="text-[11px] text-ink-500">
            Automatically orders your skills section by relevance and impact
          </span>

          <Button
            onClick={handlePrioritize}
            loading={prioritizeMutation.isPending}
            className="gap-2 bg-cyan-600 text-white hover:bg-cyan-700 font-bold text-xs h-9 px-4 shadow-sm"
          >
            {prioritizeMutation.isPending ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Optimizing Matrix…</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                <span>Prioritize & Save Order</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Matrix */}
      {result ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Prioritized Skills List */}
            <div className="skills-category-card space-y-3">
              <div className="flex items-center justify-between border-b border-ink-100/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-600" />
                  <h4 className="text-xs font-bold text-ink-900">Ranked Technical Proficiencies</h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-600">Saved to Resume</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(result.prioritizedSkills && result.prioritizedSkills.length > 0) ? (
                  result.prioritizedSkills.map((s, i) => (
                    <span key={i} className="skills-pill">
                      <span className="font-mono text-[10px] opacity-70">#{i + 1}</span>
                      <span>{s}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-500">No skills returned.</span>
                )}
              </div>
            </div>

            {/* Recommended Missing Suggestions with 1-click Add */}
            <div className="skills-category-card space-y-3">
              <div className="flex items-center justify-between border-b border-ink-100/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h4 className="text-xs font-bold text-ink-900">High-Demand Missing Keywords</h4>
                </div>
                <span className="text-[10px] text-ink-400">Click to add to resume</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(result.missingSuggestions && result.missingSuggestions.length > 0) ? (
                  result.missingSuggestions.map((s, i) => {
                    const isAdded = addedSkills.has(s)
                    return (
                      <button
                        key={i}
                        onClick={() => handleQuickAddSkill(s)}
                        disabled={isAdded}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
                          isAdded
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-paper-100 border-ink-200 text-ink-700 hover:border-cyan-500 hover:text-cyan-700 cursor-pointer dark:bg-slate-900'
                        }`}
                      >
                        {isAdded ? <Check className="h-3 w-3 text-emerald-600" /> : <Plus className="h-3 w-3 text-cyan-600" />}
                        <span>{s}</span>
                      </button>
                    )
                  })
                ) : (
                  <span className="text-xs text-ink-500">All target skills are accounted for!</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/resumes/${selectedResumeId}/edit/skills`)}
              className="text-xs gap-1.5"
            >
              <span>Manage Full Skills List</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center bg-paper-50/50">
          <Layers className="mx-auto h-10 w-10 text-cyan-500/70 mb-2" />
          <h4 className="text-sm font-bold text-ink-800">Optimize skill ordering</h4>
          <p className="text-xs text-ink-500 max-w-md mx-auto mt-1">
            Specify your target job role above and click "Prioritize & Save Order" to reorganize your skills section for ATS algorithms.
          </p>
        </div>
      )}
    </div>
  )
}
