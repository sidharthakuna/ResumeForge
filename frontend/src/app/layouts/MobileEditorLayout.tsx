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
} from 'lucide-react'
import { clsx } from 'clsx'
import { useFullResume } from '@/features/resume-editor/hooks/useResume'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { getTemplateById } from '@/features/templates/renderers/registry'
import { editorSections, toolSections } from '@/components/layout/nav-config'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ApiError } from '@/lib/axios'
import { MobileFloatingDock } from '@/components/layout/MobileFloatingDock'

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

  // Zoom controls for mobile preview mode
  const [zoom, setZoom] = useState<number | 'auto'>('auto')
  const [autoZoom, setAutoZoom] = useState(50)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (activeTab !== 'preview') return
    const el = previewContainerRef.current
    if (!el) return
    const PADDING = 32
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const width = entry.contentRect.width ?? el.clientWidth
      const height = entry.contentRect.height ?? el.clientHeight
      const fitWidth = ((width - PADDING) / A4_WIDTH_PX) * 100
      const fitHeight = ((height - PADDING) / A4_HEIGHT_PX) * 100
      const fitted = Math.max(25, Math.min(120, Math.round(Math.min(fitWidth, fitHeight))))
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
  const allSections = [...editorSections, ...toolSections]
  const currentIndex = allSections.findIndex((sec) => location.pathname === sec.path(resumeId))
  const currentSection = currentIndex >= 0 ? allSections[currentIndex] : editorSections[0]

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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-paper-100 xl:hidden">
      {/* Mobile Top Navigation Header */}
      <header className="glass-surface sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-ink-100 px-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/dashboard"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p className="truncate font-display text-sm font-semibold text-ink-900">
            {full.resume.title || 'Untitled resume'}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <Link
            to={`/resumes/${resumeId}/export`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </Link>
          <Link
            to={`/resumes/${resumeId}/export`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass-500 text-paper-50 shadow-xs hover:bg-brass-400"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Top Section Pills & Controls Bar */}
      <div className={clsx('glass-surface border-b border-ink-100 px-3 py-2 shrink-0 relative', sectionMenuOpen ? 'z-45' : 'z-20')}>
        <div className="relative">
          <div className="flex items-center justify-between gap-2">
            {/* Step Navigation Pill Group */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevSection}
                disabled={!prevSection}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 bg-paper-50 text-ink-700 hover:bg-ink-50 disabled:opacity-30 disabled:hover:bg-paper-50"
                aria-label="Previous section"
                title={prevSection ? `Previous: ${prevSection.label}` : 'Start of sections'}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setSectionMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg bg-brass-100 text-brass-700 border border-brass-300 dark:border-transparent dark:bg-brass-500/20 dark:text-brass-400 px-3 py-1.5 text-xs font-bold shadow-xs"
              >
                <currentSection.icon className="h-3.5 w-3.5" />
                <span>{currentSection.label}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              <button
                onClick={goToNextSection}
                disabled={!nextSection}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 bg-paper-50 text-ink-700 hover:bg-ink-50 disabled:opacity-30 disabled:hover:bg-paper-50"
                aria-label="Next section"
                title={nextSection ? `Next: ${nextSection.label}` : 'End of sections'}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* View Mode Segmented Pill Switch */}
            {!isFullWidthPage && (
              <div className="flex rounded-lg bg-ink-100 border border-ink-200 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all',
                    activeTab === 'edit'
                      ? 'bg-paper-50 font-semibold text-ink-900 shadow-xs'
                      : 'text-ink-600 hover:text-ink-900',
                  )}
                >
                  <FileText className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all',
                    activeTab === 'preview'
                      ? 'bg-paper-50 font-semibold text-ink-900 shadow-xs'
                      : 'text-ink-600 hover:text-ink-900',
                  )}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
              </div>
            )}
          </div>

          {/* Top Section Dropdown Selector (opens downwards) */}
          {sectionMenuOpen && (
            <>
              {/* Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setSectionMenuOpen(false)}
              />
              <div className="absolute left-0 top-11 z-50 w-64 max-h-[75vh] overflow-y-auto scrollbar-thin rounded-xl border border-ink-200 bg-paper-50 p-2 shadow-2xl dark:border-ink-100 dark:bg-paper-50 animate-in fade-in zoom-in-95 duration-150">
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Content Sections
                </p>
                <div className="space-y-0.5">
                  {editorSections.map((sec) => (
                    <button
                      key={sec.label}
                      onClick={() => {
                        navigate(sec.path(resumeId))
                        setSectionMenuOpen(false)
                        setActiveTab('edit')
                      }}
                      className={clsx(
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        location.pathname === sec.path(resumeId)
                          ? 'bg-brass-100 text-brass-700 dark:bg-brass-500/20 dark:text-brass-400 font-bold'
                          : 'text-ink-800 hover:bg-ink-100 hover:text-ink-950 dark:text-ink-700 dark:hover:bg-ink-50',
                      )}
                    >
                      <sec.icon className="h-4 w-4 shrink-0 text-brass-500" />
                      <span>{sec.label}</span>
                    </button>
                  ))}
                </div>
                <div className="my-1.5 border-t border-ink-100" />
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Tools &amp; Export
                </p>
                <div className="space-y-0.5">
                  {toolSections.map((sec) => (
                    <button
                      key={sec.label}
                      onClick={() => {
                        navigate(sec.path(resumeId))
                        setSectionMenuOpen(false)
                        setActiveTab('edit')
                      }}
                      className={clsx(
                        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        location.pathname === sec.path(resumeId)
                          ? 'bg-brass-100 text-brass-700 dark:bg-brass-500/20 dark:text-brass-400 font-bold'
                          : 'text-ink-800 hover:bg-ink-100 hover:text-ink-950 dark:text-ink-700 dark:hover:bg-ink-50',
                      )}
                    >
                      <sec.icon className="h-4 w-4 shrink-0 text-cyan-500" />
                      <span>{sec.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Body (with bottom padding for bottom dock + virtual keyboard) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 pb-36 sm:p-5 scroll-pb-32">
        {isFullWidthPage || activeTab === 'edit' ? (
          <div className={clsx('mx-auto', isFullWidthPage ? 'max-w-7xl' : 'max-w-xl')}>
            <Outlet context={{ full, resumeId }} />
          </div>
        ) : (
          <div className="flex h-full flex-col pb-16">
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
                  className="origin-top-left bg-white shadow-lg"
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

            <div className="flex items-center justify-center gap-2 border-t border-ink-100 bg-paper-50 py-2">
              <button
                onClick={() => setZoom(Math.max(25, effectiveZoom - 5))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50"
                aria-label="Zoom out"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center font-mono text-xs text-ink-600">{effectiveZoom}%</span>
              <button
                onClick={() => setZoom(Math.min(120, effectiveZoom + 5))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50"
                aria-label="Zoom in"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setZoom('auto')}
                disabled={zoom === 'auto'}
                className="ml-1 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-ink-50 disabled:text-brass-500"
              >
                <Maximize2 className="h-3 w-3" /> Fit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modular Mobile Floating Dock Component */}
      <MobileFloatingDock
        resumeId={resumeId}
        allSections={allSections}
        editorSections={editorSections}
        toolSections={toolSections}
        currentIndex={currentIndex}
        currentSection={currentSection}
        prevSection={prevSection}
        nextSection={nextSection}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isFullWidthPage={isFullWidthPage}
        goToPrevSection={goToPrevSection}
        goToNextSection={goToNextSection}
      />
    </div>
  )
}

