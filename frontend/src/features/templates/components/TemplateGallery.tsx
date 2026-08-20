import { useMemo, useState } from 'react'
import {
  Check,
  Eye,
  LayoutGrid,
  Rows3,
  X,
  FileCheck2,
  Columns2,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Camera,
} from 'lucide-react'
import { clsx } from 'clsx'
import { templateRegistry, TEMPLATE_CATEGORIES } from '../renderers/registry'
import type { TemplateCategory } from '../renderers/types'
import type { FullResumeResponse } from '@/types/api'

function getCategoryIcon(key: TemplateCategory) {
  switch (key) {
    case 'all':
      return LayoutGrid
    case 'ats':
      return FileCheck2
    case 'two-column':
      return Columns2
    case 'single-column':
      return Rows3
    case 'project-based':
      return FolderGit2
    case 'experience-based':
      return Briefcase
    case 'studies-based':
      return GraduationCap
    case 'photo':
      return Camera
    default:
      return LayoutGrid
  }
}

interface TemplateGalleryProps {
  full: FullResumeResponse
  selectedId: string
  onSelect: (templateId: string) => void
  /** If provided, "Use Template" navigates to this per-resume export/editor flow instead of just selecting locally. */
  initialQuery?: string
}

export function TemplateGallery({ full, selectedId, onSelect, initialQuery = '' }: TemplateGalleryProps) {
  const [query, setQuery] = useState(initialQuery)
  const [filter, setFilter] = useState<TemplateCategory>('all')
  const [dense, setDense] = useState(true)
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: templateRegistry.length,
    }
    TEMPLATE_CATEGORIES.forEach((cat) => {
      if (cat.key !== 'all') {
        counts[cat.key] = templateRegistry.filter((t) => t.categories?.includes(cat.key)).length
      }
    })
    return counts
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return templateRegistry.filter((t) => {
      const matchesCategory =
        filter === 'all' ||
        (t.categories && t.categories.includes(filter))

      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.badge ?? '').toLowerCase().includes(q) ||
        (t.categories ?? []).some((c) => c.toLowerCase().includes(q))

      return matchesCategory && matchesQuery
    })
  }, [query, filter])

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Bar */}
      <div className="template-search-bar-card p-4 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-80">
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search templates by name, style, or role…"
              className="template-search-input"
            />
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            <button
              onClick={() => setDense(false)}
              aria-label="Comfortable grid"
              className={clsx(
                'template-density-btn',
                !dense && 'template-density-btn-active',
              )}
            >
              <Rows3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDense(true)}
              aria-label="Compact grid"
              className={clsx(
                'template-density-btn',
                dense && 'template-density-btn-active',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Group Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.key)
            const count = categoryCounts[cat.key] ?? 0
            const isActive = filter === cat.key

            return (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={clsx(
                  'group flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                    : 'bg-paper-100/80 hover:bg-paper-200/80 text-ink-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                )}
                title={cat.description}
              >
                <Icon className={clsx('h-3.5 w-3.5', isActive ? 'text-white' : 'text-indigo-500 dark:text-indigo-400')} />
                <span>{cat.label}</span>
                <span
                  className={clsx(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-paper-200 text-ink-600 dark:bg-slate-700 dark:text-slate-300',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-semibold text-ink-600">No templates found matching your criteria.</p>
          <button
            onClick={() => {
              setFilter('all')
              setQuery('')
            }}
            className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={dense ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid grid-cols-1 gap-6 sm:grid-cols-2'}>
          {filtered.map((template) => {
            const isSelected = template.id === selectedId
            return (
              <article
                key={template.id}
                className={clsx(
                  'template-card group flex flex-col',
                  isSelected && 'template-card-selected',
                )}
              >
                {/* Thumbnail Canvas - 100% Visible & Legible */}
                <div
                  className="relative aspect-[210/297] w-full overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 cursor-pointer"
                  style={{ containerType: 'inline-size' }}
                  onClick={() => setPreviewingId(template.id)}
                >
                  <div
                    className="absolute left-0 top-0 origin-top-left overflow-hidden transition-transform duration-300 group-hover:scale-[1.015]"
                    style={{
                      width: '793.7px',
                      height: '1122.5px',
                      transform: 'scale(calc(100cqw / 793.7px))',
                    }}
                  >
                    <iframe
                      title={template.name}
                      sandbox="allow-same-origin"
                      srcDoc={template.render(full)}
                      className="pointer-events-none block border-0 bg-white"
                      style={{ width: '793.7px', height: '1122.5px' }}
                    />
                  </div>

                  {/* Top-Left Badge */}
                  {template.badge && (
                    <div className="absolute left-3 top-3 z-10">
                      <span className="rounded-lg bg-indigo-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-xs">
                        {template.badge}
                      </span>
                    </div>
                  )}

                  {/* Top-Right Floating Quick-Preview Eye Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewingId(template.id)
                    }}
                    className="template-preview-float-eye absolute right-3 top-3 z-10"
                    title="Expand full preview"
                    aria-label="Expand full preview"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Card Info & Dedicated Actions Footer */}
                <div className="flex flex-1 flex-col justify-between p-4 bg-transparent">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="template-title">{template.name}</h3>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300">
                          <Check className="h-3 w-3 stroke-[3]" /> Active
                        </span>
                      )}
                    </div>
                    <p className="template-desc mt-1 line-clamp-2">{template.description}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                    <button
                      onClick={() => onSelect(template.id)}
                      className={clsx(
                        'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all',
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-xs',
                      )}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[3]" /> Selected
                        </>
                      ) : (
                        'Use Template'
                      )}
                    </button>

                    <button
                      onClick={() => setPreviewingId(template.id)}
                      className="template-preview-btn"
                      title="Full Screen Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {previewingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewingId(null)}
        >
          <div
            className="relative flex flex-col items-center max-h-[92vh] max-w-[95vw] sm:max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header controls bar */}
            <div className="mb-3 flex w-full items-center justify-between gap-3 px-1">
              <span className="font-display font-bold text-sm sm:text-base text-white drop-shadow-md truncate">
                {templateRegistry.find((t) => t.id === previewingId)?.name} Preview
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    onSelect(previewingId)
                    setPreviewingId(null)
                  }}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-500 active:scale-95"
                >
                  Use Template
                </button>
                <button
                  onClick={() => setPreviewingId(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white shadow-md ring-1 ring-white/30 transition-all hover:bg-white/35 hover:scale-105 active:scale-95"
                  aria-label="Close preview"
                  title="Close preview"
                >
                  <X className="h-5 w-5 text-white" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* A4 Container Box (Auto-fits A4 aspect ratio 210/297 to screen bounds) */}
            <div
              className="relative overflow-hidden rounded-xl border border-ink-100/20 bg-white shadow-2xl"
              style={{
                width: 'min(88vw, calc(78vh * 210 / 297), 640px)',
                aspectRatio: '210 / 297',
                containerType: 'inline-size',
              }}
            >
              <div
                className="absolute left-0 top-0 origin-top-left overflow-hidden"
                style={{
                  width: '793.7px',
                  height: '1122.5px',
                  transform: 'scale(calc(100cqw / 793.7px))',
                }}
              >
                <iframe
                  title="Fullscreen preview"
                  sandbox="allow-same-origin"
                  srcDoc={templateRegistry.find((t) => t.id === previewingId)?.render(full)}
                  className="block border-0 bg-white"
                  style={{ width: '793.7px', height: '1122.5px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
