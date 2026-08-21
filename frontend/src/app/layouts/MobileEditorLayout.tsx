import { useState, useRef, useLayoutEffect } from 'react'
import { Outlet, useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Share2,
  Download,
  Eye,
  FileText,
  Minus,
  Plus,
  Maximize2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileWarning,
  Check,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useFullResume } from '@/features/resume-editor/hooks/useResume'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { getTemplateById, templateSupportsPhoto } from '@/features/templates/renderers/registry'
import { getEditorSections, toolSections } from '@/components/layout/nav-config'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ApiError } from '@/lib/axios'

const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

export function MobileEditorLayout() {
  const { resumeId } = useParams<{ resumeId: string }>()
  const { data: full, isLoading, error } = useFullResume(resumeId)
  const selectedTemplateId = useEditorUiStore((s) => s.getSelectedTemplate(resumeId ?? ''))
  const location = useLocation()
  const navigate = useNavigate()

  // Mobile active mode: 'edit' | 'preview'
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false)

  // Zoom controls for mobile preview mode — defaulted to 45% for perfect mobile viewport fit
  const [zoom, setZoom] = useState<number | 'auto'>('auto')
  const [autoZoom, setAutoZoom] = useState(45)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (activeTab !== 'preview') return
    const el = previewContainerRef.current
    if (!el) return
    const PADDING = 24
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const width = entry.contentRect.width ?? el.clientWidth
      const height = entry.contentRect.height ?? el.clientHeight
      const fitWidth = ((width - PADDING) / A4_WIDTH_PX) * 100
      const fitHeight = ((height - PADDING) / A4_HEIGHT_PX) * 100
      // Scale fitted between 25% and 45% on mobile devices
      const fitted = Math.max(25, Math.min(45, Math.round(Math.min(fitWidth, fitHeight))))
      setAutoZoom(fitted)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [activeTab])


  const effectiveZoom = zoom === 'auto' ? autoZoom : zoom

  if (!resumeId) return null

  if (isLoading) {
    return <FullPageSpinner label="Loading your resume…" />
  }

  if (error || !full) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <EmptyState
          icon={FileWarning}
          title="Couldn't load this resume"
          description={
            error instanceof ApiError
              ? error.message
              : "This resume may have been deleted, or you don't have access to it."
          }
        />
      </div>
    )
  }

  const template = getTemplateById(selectedTemplateId)
  const supportsPhoto = templateSupportsPhoto(template)
  const visibleEditorSections = getEditorSections(supportsPhoto)
  const allSections = [...visibleEditorSections, ...toolSections]
  const currentIndex = allSections.findIndex((sec) => location.pathname === sec.path(resumeId))
  const currentSection = currentIndex >= 0 ? allSections[currentIndex] : visibleEditorSections[0]

  const isFullWidthPage =
    location.pathname.endsWith('/templates') ||
    location.pathname.endsWith('/ai') ||
    location.pathname.endsWith('/export')

  const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null
  const nextSection = currentIndex >= 0 && currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null

  function goToPrevSection() {
    if (prevSection && resumeId) {
      navigate(prevSection.path(resumeId))
    }
  }

  function goToNextSection() {
    if (nextSection && resumeId) {
      navigate(nextSection.path(resumeId))
    }
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-paper-100 lg:hidden">
      {/* Mobile Top Navigation Header */}
      <header className="sticky top-0 z-30 flex h-13 shrink-0 items-center justify-between border-b border-ink-100 bg-paper-50/95 px-3 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/dashboard"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-ink-600 hover:bg-ink-100/60 hover:text-ink-900 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div className="min-w-0">
            <p className="truncate font-display text-xs sm:text-sm font-bold text-ink-900">
              {full.resume.title || 'Untitled resume'}
            </p>
            <p className="text-[10px] text-ink-500 truncate font-medium">
              {template.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <Link
            to={`/resumes/${resumeId}/export`}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-ink-200 bg-paper-100/50 text-ink-700 hover:bg-paper-100 transition-colors shadow-2xs"
            title="Share"
          >
            <Share2 className="h-3.5 w-3.5" />
          </Link>
          <Link
            to={`/resumes/${resumeId}/export`}
            className="flex h-8 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition-all active:scale-95"
            title="Download PDF"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Link>
        </div>
      </header>

      {/* Streamlined Section Stepper & Mode Switcher Bar */}
      <div className={clsx('sticky top-13 border-b border-ink-100 bg-paper-50 px-2.5 py-1.5 shrink-0 shadow-2xs backdrop-blur-sm', sectionMenuOpen ? 'z-45' : 'z-20')}>
        <div className="relative">
          <div className="flex items-center justify-between gap-1.5">
            {/* Step Stepper Pill with Dropdown */}
            <div className="flex items-center gap-1 min-w-0">
              <button
                onClick={goToPrevSection}
                disabled={!prevSection}
                className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-paper-100/60 text-ink-700 hover:bg-paper-100 disabled:opacity-30 disabled:hover:bg-paper-100/60 transition-colors"
                aria-label="Previous section"
                title={prevSection ? `Previous: ${prevSection.label}` : 'Start of sections'}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setSectionMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/90 px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300 transition-colors min-w-0"
              >
                <currentSection.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{currentSection.label}</span>
                <span className="rounded bg-indigo-200/70 px-1 py-0.2 text-[9px] font-mono font-bold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                  {currentIndex + 1}/{allSections.length}
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
              </button>

              <button
                onClick={goToNextSection}
                disabled={!nextSection}
                className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-paper-100/60 text-ink-700 hover:bg-paper-100 disabled:opacity-30 disabled:hover:bg-paper-100/60 transition-colors"
                aria-label="Next section"
                title={nextSection ? `Next: ${nextSection.label}` : 'End of sections'}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* View Mode Segmented Pill Switch */}
            {!isFullWidthPage && (
              <div className="flex rounded-lg bg-ink-100/60 border border-ink-200 p-0.5 text-xs font-semibold shrink-0">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={clsx(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-all',
                    activeTab === 'edit'
                      ? 'bg-white font-bold text-indigo-700 shadow-2xs dark:bg-paper-50 dark:text-indigo-400'
                      : 'text-ink-600 hover:text-ink-900',
                  )}
                >
                  <FileText className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={clsx(
                    'flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-all',
                    activeTab === 'preview'
                      ? 'bg-white font-bold text-indigo-700 shadow-2xs dark:bg-paper-50 dark:text-indigo-400'
                      : 'text-ink-600 hover:text-ink-900',
                  )}
                >
                  <Eye className="h-3 w-3" /> Preview
                </button>
              </div>
            )}
          </div>

          {/* Section Dropdown Menu */}
          {sectionMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
                onClick={() => setSectionMenuOpen(false)}
              />
              <div className="absolute left-0 top-10 z-50 w-64 max-h-[70vh] overflow-y-auto scrollbar-thin rounded-2xl border border-ink-200 bg-paper-50 p-2 shadow-2xl dark:border-ink-200 animate-in fade-in zoom-in-95 duration-150">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Editor Sections ({visibleEditorSections.length})
                </p>
                <div className="space-y-0.5">
                  {visibleEditorSections.map((sec, sIdx) => {
                    const isActive = location.pathname === sec.path(resumeId)
                    return (
                      <button
                        key={sec.label}
                        onClick={() => {
                          navigate(sec.path(resumeId))
                          setSectionMenuOpen(false)
                          setActiveTab('edit')
                        }}
                        className={clsx(
                          'flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors',
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'text-ink-700 hover:bg-paper-100 hover:text-ink-900',
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] text-ink-400 w-4 text-right">{sIdx + 1}</span>
                          <sec.icon className={clsx('h-3.5 w-3.5 shrink-0', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-ink-400')} />
                          <span className="truncate">{sec.label}</span>
                        </div>
                        {isActive && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>

                <div className="my-1.5 border-t border-ink-100" />
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Tools &amp; Export
                </p>
                <div className="space-y-0.5">
                  {toolSections.map((sec) => {
                    const isActive = location.pathname === sec.path(resumeId)
                    return (
                      <button
                        key={sec.label}
                        onClick={() => {
                          navigate(sec.path(resumeId))
                          setSectionMenuOpen(false)
                          setActiveTab('edit')
                        }}
                        className={clsx(
                          'flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors',
                          isActive
                            ? 'bg-purple-50 text-purple-700 font-bold dark:bg-purple-950/60 dark:text-purple-300'
                            : 'text-ink-700 hover:bg-paper-100 hover:text-ink-900',
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <sec.icon className={clsx('h-3.5 w-3.5 shrink-0', isActive ? 'text-purple-600 dark:text-purple-400' : 'text-ink-400')} />
                          <span className="truncate">{sec.label}</span>
                        </div>
                        {isActive && <Check className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 pb-12 sm:p-5">
        {isFullWidthPage || activeTab === 'edit' ? (
          <div className={clsx('mx-auto', isFullWidthPage ? 'max-w-7xl' : 'max-w-xl')}>
            <Outlet context={{ full, resumeId }} />
          </div>
        ) : (
          <div className="flex h-full flex-col pb-4">
            <div
              ref={previewContainerRef}
              className="flex min-w-0 flex-1 items-center justify-center overflow-auto p-2"
            >
              <div
                className="mx-auto"
                style={{
                  width: `calc(210mm * ${effectiveZoom / 100})`,
                  height: `calc(297mm * ${effectiveZoom / 100})`,
                }}
              >
                <div
                  className="origin-top-left bg-white shadow-lg rounded-sm"
                  style={{ width: '210mm', height: '297mm', transform: `scale(${effectiveZoom / 100})` }}
                >
                  <iframe
                    title="Mobile resume preview"
                    sandbox="allow-same-origin"
                    srcDoc={template.render(full)}
                    className="pointer-events-none block h-[297mm] w-[210mm] border-0"
                  />
                </div>
              </div>
            </div>

            {/* Compact Floating Zoom Controls */}
            <div className="flex items-center justify-center gap-2 border-t border-ink-100 bg-paper-50/95 py-2 px-3 backdrop-blur-xs">
              <button
                onClick={() => setZoom(Math.max(25, effectiveZoom - 5))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-200 bg-paper-100/50 text-ink-600 hover:bg-paper-100"
                aria-label="Zoom out"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-10 text-center font-mono text-xs font-bold text-ink-700">{effectiveZoom}%</span>
              <button
                onClick={() => setZoom(Math.min(120, effectiveZoom + 5))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-200 bg-paper-100/50 text-ink-600 hover:bg-paper-100"
                aria-label="Zoom in"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={() => setZoom('auto')}
                disabled={zoom === 'auto'}
                className="ml-1 flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300"
              >
                <Maximize2 className="h-3 w-3" /> Fit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


