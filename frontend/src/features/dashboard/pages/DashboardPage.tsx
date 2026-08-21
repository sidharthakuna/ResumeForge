import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Plus,
  FileText,
  CheckCircle2,
  Download,
  Clock,
  Sun,
  Sunrise,
  Sparkles,
  FolderOpen,
  Target,
  Wand2,
  Layers,
  ArrowRight,
  Bot,
  Zap,
} from 'lucide-react'
import { useDashboardResumes, useInvalidateDashboard } from '@/features/dashboard/api/useDashboardResumes'
import { registerResumeId, unregisterResumeId } from '@/features/dashboard/lib/resume-registry'
import { useCreateResume, useDeleteResume } from '@/features/resume-editor/hooks/useResume'
import { ResumeCard } from '@/features/dashboard/components/ResumeCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { getUser } from '@/lib/session'

export default function DashboardPage() {
  const user = getUser()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { data: resumes, isLoading } = useDashboardResumes()
  const invalidate = useInvalidateDashboard()
  const createResume = useCreateResume()
  const deleteResume = useDeleteResume()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  async function handleCreate() {
    const created = await createResume.mutateAsync({ title: 'Untitled resume' })
    registerResumeId(created.id)
    invalidate()
    navigate(`/resumes/${created.id}/edit/personal`)
  }

  useEffect(() => {
    if (params.get('create') === '1' && !createResume.isPending) {
      params.delete('create')
      setParams(params, { replace: true })
      handleCreate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  function confirmDelete() {
    if (!pendingDeleteId) return
    deleteResume.mutate(pendingDeleteId, {
      onSuccess: () => {
        unregisterResumeId(pendingDeleteId)
        invalidate()
        setPendingDeleteId(null)
      },
    })
  }

  if (isLoading) return <FullPageSpinner label="Loading your resumes…" />

  const totalResumes = resumes?.length ?? 0
  const completedCount = resumes?.filter((r) => r.full.resume.status === 'COMPLETED').length ?? 0
  const totalDownloads = resumes?.reduce((sum, r) => sum + r.downloadCount, 0) ?? 0
  const mostRecent = resumes?.length
    ? resumes.reduce((latest, r) => (new Date(r.addedAt) > new Date(latest.addedAt) ? r : latest))
    : null

  const activeResume = resumes?.[0]

  return (
    <div className="dashboard-container space-y-8" id="your-resumes">
      {/* 1. Header Hero Card */}
      <div className="dashboard-hero-card">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="hidden sm:flex dashboard-hero-icon">
              <TimeOfDayIcon />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="dashboard-greeting-title text-lg sm:text-2xl font-bold text-ink-900">
                  Good {timeOfDayGreeting()}, {user?.fullName?.split(' ')[0] ?? 'there'}
                </h1>
                <span className="inline-flex sm:hidden">
                  <TimeOfDayIcon />
                </span>
              </div>
              <p className="dashboard-greeting-sub text-xs sm:text-sm text-ink-600 dark:text-ink-400 mt-0.5 sm:mt-1">
                Create, tailor with AI, and export ATS-optimized resumes.
              </p>

              {/* Status Badges */}
              <div className="mt-2.5 sm:mt-3.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg border border-indigo-200/80 bg-indigo-50/80 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Sparkles className="h-3 w-3" /> AI Tailoring
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> ATS Ready
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-ink-700 dark:border-ink-200 dark:bg-ink-100/50">
                  <FileText className="h-3 w-3" /> {totalResumes} {totalResumes === 1 ? 'Resume' : 'Resumes'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
            <Button
              variant="outline"
              onClick={() => navigate('/ai')}
              className="flex-1 sm:flex-none gap-1.5 rounded-xl text-xs font-semibold border-slate-300 dark:border-slate-700 h-9"
            >
              <Bot className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              AI Assistant
            </Button>
            <Button
              onClick={handleCreate}
              loading={createResume.isPending}
              className="flex-1 sm:flex-none gap-1.5 bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs font-semibold rounded-xl text-xs h-9"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              New resume
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Real Metrics Row (Backed by Spring Boot Backend Data) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {/* Metric 1: Total Resumes */}
        <div className="dashboard-metric-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="dashboard-metric-label text-[10px] sm:text-xs">Total Resumes</span>
            <div className="flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl dashboard-icon-indigo">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="dashboard-metric-value text-xl sm:text-2xl font-bold">{totalResumes}</p>
            <p className="dashboard-metric-subtext text-[10px] sm:text-xs">Active documents</p>
          </div>
        </div>

        {/* Metric 2: Ready to Export */}
        <div className="dashboard-metric-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="dashboard-metric-label text-[10px] sm:text-xs">Ready to Export</span>
            <div className="flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl dashboard-icon-emerald">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="dashboard-metric-value text-xl sm:text-2xl font-bold">{completedCount}</p>
            <p className="dashboard-metric-subtext text-[10px] sm:text-xs">Completed profiles</p>
          </div>
        </div>

        {/* Metric 3: PDF Downloads */}
        <div className="dashboard-metric-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="dashboard-metric-label text-[10px] sm:text-xs">PDF Downloads</span>
            <div className="flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl dashboard-icon-cyan">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="dashboard-metric-value text-xl sm:text-2xl font-bold">{totalDownloads}</p>
            <p className="dashboard-metric-subtext text-[10px] sm:text-xs">Generated copies</p>
          </div>
        </div>

        {/* Metric 4: Last Activity */}
        <div className="dashboard-metric-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="dashboard-metric-label text-[10px] sm:text-xs">Last Activity</span>
            <div className="flex h-7.5 w-7.5 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl dashboard-icon-purple">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="dashboard-metric-value text-xl sm:text-2xl font-bold">
              {mostRecent ? formatLastEdited(mostRecent.addedAt) : 'None'}
            </p>
            <p className="dashboard-metric-subtext text-[10px] sm:text-xs">Most recent update</p>
          </div>
        </div>
      </div>

      {/* 3. AI Assistant Features (Directly linked to Backend AI Services) */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 border border-purple-200 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/40">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink-900">AI Career Intelligence</h2>
              <p className="text-[11px] text-ink-500">Gemini-powered tools to tailor and optimize your resume</p>
            </div>
          </div>
          <Link
            to={activeResume ? `/ai?resumeId=${activeResume.full.resume.id}` : '/ai'}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <span>Open AI Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Subsystem 1: ATS Audit */}
          <div
            onClick={() => navigate(activeResume ? `/ai/ats?resumeId=${activeResume.full.resume.id}` : '/ai/ats')}
            className="group cursor-pointer rounded-2xl border border-ink-200 bg-paper-50 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/60 hover:shadow-md dark:border-ink-200 dark:bg-paper-50/80"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Target className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                ATS Audit
              </span>
            </div>
            <h3 className="mt-3 text-xs font-bold text-ink-900 group-hover:text-emerald-600 transition-colors">
              ATS Compatibility Check
            </h3>
            <p className="mt-1 text-[11px] text-ink-500 leading-relaxed">
              Scan keyword match, formatting, and section parsing against ATS criteria.
            </p>
          </div>

          {/* Subsystem 2: Job Tailor */}
          <div
            onClick={() => navigate(activeResume ? `/ai/tailor?resumeId=${activeResume.full.resume.id}` : '/ai/tailor')}
            className="group cursor-pointer rounded-2xl border border-ink-200 bg-paper-50 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/60 hover:shadow-md dark:border-ink-200 dark:bg-paper-50/80"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Zap className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                Job Match
              </span>
            </div>
            <h3 className="mt-3 text-xs font-bold text-ink-900 group-hover:text-indigo-600 transition-colors">
              Job Description Tailoring
            </h3>
            <p className="mt-1 text-[11px] text-ink-500 leading-relaxed">
              Paste a target job description to extract keywords and align your experience.
            </p>
          </div>

          {/* Subsystem 3: AI Summary Studio */}
          <div
            onClick={() => navigate(activeResume ? `/ai/summary?resumeId=${activeResume.full.resume.id}` : '/ai/summary')}
            className="group cursor-pointer rounded-2xl border border-ink-200 bg-paper-50 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/60 hover:shadow-md dark:border-ink-200 dark:bg-paper-50/80"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Wand2 className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                Summary AI
              </span>
            </div>
            <h3 className="mt-3 text-xs font-bold text-ink-900 group-hover:text-purple-600 transition-colors">
              AI Professional Summary
            </h3>
            <p className="mt-1 text-[11px] text-ink-500 leading-relaxed">
              Generate executive summary pitches tailored to your seniority and industry.
            </p>
          </div>

          {/* Subsystem 4: Skills Optimizer */}
          <div
            onClick={() => navigate(activeResume ? `/ai/skills?resumeId=${activeResume.full.resume.id}` : '/ai/skills')}
            className="group cursor-pointer rounded-2xl border border-ink-200 bg-paper-50 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/60 hover:shadow-md dark:border-ink-200 dark:bg-paper-50/80"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                <Layers className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-extrabold text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300">
                Matrix
              </span>
            </div>
            <h3 className="mt-3 text-xs font-bold text-ink-900 group-hover:text-cyan-600 transition-colors">
              Skills Prioritizer
            </h3>
            <p className="mt-1 text-[11px] text-ink-500 leading-relaxed">
              Rank and categorize technical proficiencies for recruiter & ATS visibility.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Recent Resumes Overview */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="dashboard-section-title">Recent Resumes</h2>
              <p className="text-[11px] text-ink-500">Pick up where you left off or create a new document</p>
            </div>
          </div>
          <Link
            to="/resumes"
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <span>View All ({totalResumes})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {totalResumes === 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <CreateResumeTile onClick={handleCreate} loading={createResume.isPending} />
            <div className="sm:col-span-1 lg:col-span-2 xl:col-span-3">
              <EmptyState
                icon={FileText}
                title="No resumes created yet"
                description="Start with a clean canvas or import your existing background. It only takes a minute."
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <CreateResumeTile onClick={handleCreate} loading={createResume.isPending} />
            {resumes!.slice(0, 7).map((r) => (
              <ResumeCard
                key={r.full.resume.id}
                full={r.full}
                addedAt={r.addedAt}
                downloadCount={r.downloadCount}
                onDelete={() => setPendingDeleteId(r.full.resume.id)}
              />
            ))}
          </div>
        )}

      </section>

      {/* 5. Supported Templates Gallery Showcase */}
      <section className="rounded-2xl border border-ink-200 bg-paper-50 p-5 shadow-xs dark:border-ink-200 dark:bg-paper-50/80">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/40">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-ink-900">Supported Resume Layouts</h2>
              <p className="text-[11px] text-ink-500">Switch designs instantly with all sections preserved</p>
            </div>
          </div>
          <Link
            to="/templates"
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <span>View in Gallery</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Template 1: Classic */}
          <div
            onClick={() => navigate('/templates')}
            className="group cursor-pointer rounded-xl border border-ink-200 bg-paper-100/50 p-3 text-center transition-all hover:border-indigo-500/60 hover:shadow-xs dark:border-ink-200 dark:bg-paper-100/20"
          >
            <div className="h-24 w-full rounded-lg bg-white shadow-xs border border-ink-200 flex flex-col p-2 space-y-1.5 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div className="h-2 w-16 bg-indigo-600 rounded-sm" />
              <div className="h-1 w-full bg-slate-200 rounded-xs dark:bg-slate-700" />
              <div className="h-1 w-4/5 bg-slate-200 rounded-xs dark:bg-slate-700" />
              <div className="h-1.5 w-12 bg-slate-300 rounded-xs dark:bg-slate-600 mt-1" />
              <div className="h-1 w-full bg-slate-100 rounded-xs dark:bg-slate-800" />
            </div>
            <h4 className="mt-2.5 text-xs font-bold text-ink-900 group-hover:text-indigo-600">Sidhartha Classic</h4>
            <p className="text-[10px] text-ink-500">ATS Tech Standard</p>
          </div>

          {/* Template 2: Modern Split */}
          <div
            onClick={() => navigate('/templates')}
            className="group cursor-pointer rounded-xl border border-ink-200 bg-paper-100/50 p-3 text-center transition-all hover:border-indigo-500/60 hover:shadow-xs dark:border-ink-200 dark:bg-paper-100/20"
          >
            <div className="h-24 w-full rounded-lg bg-white shadow-xs border border-ink-200 flex gap-1 p-2 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div className="w-1/3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xs p-1 space-y-1">
                <div className="h-1.5 w-6 bg-indigo-600 rounded-xs" />
                <div className="h-1 w-full bg-indigo-200 rounded-xs dark:bg-indigo-800" />
              </div>
              <div className="w-2/3 space-y-1 pl-1">
                <div className="h-2 w-14 bg-slate-700 dark:bg-slate-300 rounded-xs" />
                <div className="h-1 w-full bg-slate-200 rounded-xs dark:bg-slate-700" />
                <div className="h-1 w-3/4 bg-slate-200 rounded-xs dark:bg-slate-700" />
              </div>
            </div>
            <h4 className="mt-2.5 text-xs font-bold text-ink-900 group-hover:text-indigo-600">Modern Split</h4>
            <p className="text-[10px] text-ink-500">Two-Column Visual</p>
          </div>

          {/* Template 3: Visionary Tech */}
          <div
            onClick={() => navigate('/templates')}
            className="group cursor-pointer rounded-xl border border-ink-200 bg-paper-100/50 p-3 text-center transition-all hover:border-indigo-500/60 hover:shadow-xs dark:border-ink-200 dark:bg-paper-100/20"
          >
            <div className="h-24 w-full rounded-lg bg-white shadow-xs border border-ink-200 flex flex-col p-2 space-y-1.5 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <div className="h-2 w-14 bg-cyan-600 rounded-sm" />
                <div className="h-1.5 w-6 bg-slate-300 rounded-xs" />
              </div>
              <div className="h-1 w-full bg-slate-200 rounded-xs dark:bg-slate-700" />
              <div className="h-1 w-full bg-slate-200 rounded-xs dark:bg-slate-700" />
              <div className="h-1 w-2/3 bg-slate-200 rounded-xs dark:bg-slate-700" />
            </div>
            <h4 className="mt-2.5 text-xs font-bold text-ink-900 group-hover:text-indigo-600">Visionary Tech</h4>
            <p className="text-[10px] text-ink-500">Clean Header Focus</p>
          </div>

          {/* Template 4: Minimal Elegance */}
          <div
            onClick={() => navigate('/templates')}
            className="group cursor-pointer rounded-xl border border-ink-200 bg-paper-100/50 p-3 text-center transition-all hover:border-indigo-500/60 hover:shadow-xs dark:border-ink-200 dark:bg-paper-100/20"
          >
            <div className="h-24 w-full rounded-lg bg-white shadow-xs border border-ink-200 flex flex-col items-center p-2 space-y-1.5 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              <div className="h-2 w-16 bg-slate-800 dark:bg-slate-200 rounded-sm text-center" />
              <div className="h-0.5 w-full bg-slate-300 rounded-xs" />
              <div className="h-1 w-4/5 bg-slate-200 rounded-xs dark:bg-slate-700" />
              <div className="h-1 w-full bg-slate-200 rounded-xs dark:bg-slate-700" />
            </div>
            <h4 className="mt-2.5 text-xs font-bold text-ink-900 group-hover:text-indigo-600">Minimal Elegance</h4>
            <p className="text-[10px] text-ink-500">Classic Single Column</p>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this resume?"
        description="This permanently deletes the resume and all associated sections. This action cannot be undone."
        confirmLabel="Delete resume"
        loading={deleteResume.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}

function CreateResumeTile({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="dashboard-create-tile disabled:opacity-60"
    >
      <span className="dashboard-create-tile-icon">
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </span>
      <div>
        <p className="dashboard-create-tile-title">
          {loading ? 'Creating resume…' : 'Create New Resume'}
        </p>
        <p className="mt-1 text-xs font-medium text-ink-600 max-w-[200px]">
          Start from scratch with a professional layout
        </p>
      </div>
    </button>
  )
}

function TimeOfDayIcon() {
  const h = new Date().getHours()
  if (h < 12) return <Sunrise className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={2} />
  if (h < 18) return <Sun className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={2} />
  return <Sparkles className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
}

function timeOfDayGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

function formatLastEdited(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return 'Today'
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
