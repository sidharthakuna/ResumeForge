import { Link } from 'react-router-dom'
import { MoreVertical, Trash2, Copy, Eye, Pencil } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/Badge'
import { calculateCompletion } from '@/features/resume-editor/lib/completion'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { getTemplateById } from '@/features/templates/renderers/registry'
import { getUser } from '@/lib/session'
import type { FullResumeResponse, ResumeStatus } from '@/types/api'

const statusTone: Record<ResumeStatus, 'neutral' | 'warn' | 'success'> = {
  DRAFT: 'neutral',
  IN_PROGRESS: 'warn',
  COMPLETED: 'success',
}

const statusLabel: Record<ResumeStatus, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
}

export function ResumeCard({
  full,
  addedAt,
  downloadCount,
  onDelete,
}: {
  full: FullResumeResponse
  addedAt?: string
  downloadCount?: number
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const completion = calculateCompletion(full)
  const selectedTemplateId = useEditorUiStore((s) => s.getSelectedTemplate(full.resume.id))
  const template = getTemplateById(selectedTemplateId)
  const user = getUser()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const authorName = full.personalInfo?.fullName || user?.fullName || 'Untitled'

  return (
    <div className="group dashboard-resume-card">
      {/* Thumbnail Container (Clean Desk Canvas with Centered A4 Paper) */}
      <Link
        to={`/resumes/${full.resume.id}/edit/personal`}
        className="dashboard-resume-preview-box"
        style={{ containerType: 'inline-size' }}
      >
        <div className="absolute inset-0 flex items-start justify-center overflow-hidden pt-3">
          <div
            className="origin-top rounded-t-md bg-white shadow-md ring-1 ring-slate-900/10 dark:ring-white/10 transition-transform duration-300 group-hover:scale-[1.03]"
            style={{
              width: '793.7px',
              height: '1122.5px',
              transform: 'scale(calc(74cqw / 793.7px))',
              transformOrigin: 'top center',
            }}
          >
            <iframe
              title={full.resume.title || 'Resume preview'}
              tabIndex={-1}
              sandbox="allow-same-origin"
              srcDoc={template.render(full)}
              className="pointer-events-none block border-0 bg-white"
              style={{ width: '793.7px', height: '1122.5px' }}
            />
          </div>
        </div>

        {/* Status Badge */}
        <span className="absolute left-3 top-3 z-10">
          <Badge tone={statusTone[full.resume.status]}>{statusLabel[full.resume.status]}</Badge>
        </span>
      </Link>

      {/* Options Dropdown */}
      <div className="absolute right-3 top-3 z-10" ref={ref}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300/80 bg-white/90 text-slate-700 shadow-xs backdrop-blur-xs hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
          aria-label="Resume options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}/resumes/${full.resume.id}/edit/personal`
                navigator.clipboard.writeText(shareUrl)
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Copy className="h-3.5 w-3.5" /> Copy link
            </button>
            <button
              onClick={() => {
                setMenuOpen(false)
                onDelete()
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/30"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 bg-transparent">
        <div>
          <Link to={`/resumes/${full.resume.id}/edit/personal`}>
            <h3 className="truncate font-display text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {full.resume.title || authorName || 'Untitled Resume'}
            </h3>
            <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              {template.name}
              {addedAt && ` · ${formatDistanceToNow(new Date(addedAt), { addSuffix: true })}`}
              {!!downloadCount && ` · ${downloadCount} download${downloadCount === 1 ? '' : 's'}`}
            </p>
          </Link>

          {/* Completeness Bar */}
          <div className="mt-3.5 flex items-center gap-2.5">
            <span className="shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-400">Completeness</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-[width] duration-300"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-xs font-bold text-slate-900 dark:text-white">{completion}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
          <Link
            to={`/resumes/${full.resume.id}/edit/personal`}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 active:scale-95 transition-all"
          >
            <Pencil className="h-3.5 w-3.5 stroke-[2.2]" /> Edit Resume
          </Link>

          <Link
            to={`/resumes/${full.resume.id}/export`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 transition-all shadow-2xs"
            aria-label="Preview and Download"
            title="Preview & Export"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
