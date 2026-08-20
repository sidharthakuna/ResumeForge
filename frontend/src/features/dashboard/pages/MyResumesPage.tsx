import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  FileText,
  Search,
  SlidersHorizontal,
  FolderOpen,
  CheckCircle2,
  Download,
} from 'lucide-react'
import { useDashboardResumes, useInvalidateDashboard } from '@/features/dashboard/api/useDashboardResumes'
import { registerResumeId, unregisterResumeId } from '@/features/dashboard/lib/resume-registry'
import { useCreateResume, useDeleteResume } from '@/features/resume-editor/hooks/useResume'
import { ResumeCard } from '@/features/dashboard/components/ResumeCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function MyResumesPage() {
  const navigate = useNavigate()
  const { data: resumes, isLoading } = useDashboardResumes()
  const invalidate = useInvalidateDashboard()
  const createResume = useCreateResume()
  const deleteResume = useDeleteResume()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent')

  async function handleCreate() {
    const created = await createResume.mutateAsync({ title: 'Untitled resume' })
    registerResumeId(created.id)
    invalidate()
    navigate(`/resumes/${created.id}/edit/personal`)
  }

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

  const totalResumes = resumes?.length ?? 0
  const completedCount = resumes?.filter((r) => r.full.resume.status === 'COMPLETED').length ?? 0
  const totalDownloads = resumes?.reduce((sum, r) => sum + r.downloadCount, 0) ?? 0

  // Filtered & Sorted Resumes
  const filteredResumes = useMemo(() => {
    if (!resumes) return []
    return resumes
      .filter((r) => {
        const titleMatch = (r.full.resume.title || 'Untitled resume')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
        const nameMatch = (r.full.personalInfo?.fullName || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())

        if (!titleMatch && !nameMatch) return false

        if (statusFilter === 'completed') return r.full.resume.status === 'COMPLETED'
        if (statusFilter === 'draft') return r.full.resume.status !== 'COMPLETED'
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        }
        if (sortBy === 'oldest') {
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        }
        if (sortBy === 'title') {
          const titleA = a.full.resume.title || 'Untitled'
          const titleB = b.full.resume.title || 'Untitled'
          return titleA.localeCompare(titleB)
        }
        return 0
      })
  }, [resumes, searchQuery, statusFilter, sortBy])

  if (isLoading) return <FullPageSpinner label="Loading your resumes…" />

  return (
    <div className="dashboard-container space-y-8">
      {/* Header Banner */}
      <div className="dashboard-hero-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <FolderOpen className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">My Resumes</h1>
                <p className="text-xs text-ink-500 sm:text-sm">
                  Manage, organize, and tailor all your professional resumes.
                </p>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50/80 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                <FileText className="h-3.5 w-3.5" /> {totalResumes} {totalResumes === 1 ? 'Resume' : 'Resumes'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> {completedCount} Ready to Export
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200/80 bg-cyan-50/80 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400">
                <Download className="h-3.5 w-3.5" /> {totalDownloads} PDF Downloads
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={handleCreate}
              loading={createResume.isPending}
              className="gap-2 bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs font-semibold rounded-xl text-xs sm:text-sm px-4 py-2.5"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Create New Resume
            </Button>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-paper-50 p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-ink-200 dark:bg-paper-50/80">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by title or name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-ink-200/80 bg-paper-100/60 py-2 pl-9 pr-4 text-xs font-medium text-ink-900 placeholder:text-ink-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-ink-200 dark:bg-paper-100/30"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-ink-100/50 p-1 dark:bg-ink-200/40">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs dark:bg-paper-50 dark:text-indigo-400'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              All ({totalResumes})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-700 shadow-2xs dark:bg-paper-50 dark:text-emerald-400'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-white text-amber-700 shadow-2xs dark:bg-paper-50 dark:text-amber-400'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Drafts ({totalResumes - completedCount})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-ink-200/80 bg-paper-100/60 px-3 py-1.5 text-xs font-semibold text-ink-700 dark:border-ink-200 dark:bg-paper-100/30">
            <SlidersHorizontal className="h-3.5 w-3.5 text-ink-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-ink-700 focus:outline-none dark:text-ink-300"
            >
              <option value="recent">Recently Updated</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumes Collection Grid */}
      <section>
        {totalResumes === 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <CreateResumeTile onClick={handleCreate} loading={createResume.isPending} />
            <div className="sm:col-span-1 lg:col-span-2">
              <EmptyState
                icon={FileText}
                title="No resumes created yet"
                description="Start with a fresh resume canvas or tailor an existing one with AI in seconds."
              />
            </div>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-paper-50 p-12 text-center shadow-xs dark:border-ink-200">
            <Search className="mx-auto h-8 w-8 text-ink-400" />
            <h3 className="mt-3 text-sm font-bold text-ink-900">No matching resumes found</h3>
            <p className="mt-1 text-xs text-ink-500">
              Try adjusting your search query or switching your filter tabs.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              className="mt-4 text-xs font-semibold"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <CreateResumeTile onClick={handleCreate} loading={createResume.isPending} />
            {filteredResumes.map((r) => (
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

      {/* Delete Confirmation Modal */}
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
