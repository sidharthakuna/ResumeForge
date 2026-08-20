import { useState, useRef, useLayoutEffect } from 'react'
import { Outlet, useParams, useOutletContext, Link, useLocation } from 'react-router-dom'
import { Minus, Plus, Share2, Download, Maximize2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useFullResume } from '@/features/resume-editor/hooks/useResume'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { getTemplateById } from '@/features/templates/renderers/registry'
import { EditorSidebar } from '@/components/layout/EditorSidebar'
import { TopBar } from '@/components/layout/TopBar'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { FileWarning } from 'lucide-react'
import type { FullResumeResponse } from '@/types/api'
import { ApiError } from '@/lib/axios'

import { MobileEditorLayout } from './MobileEditorLayout'

interface EditorOutletContext {
  full: FullResumeResponse
  resumeId: string
}

/** Every editor child route calls this to get the already-loaded resume data. */
export function useEditorContext() {
  return useOutletContext<EditorOutletContext>()
}

const A4_WIDTH_PX = 794 // 210mm at 96dpi — used to compute the auto-fit scale
const A4_HEIGHT_PX = 1123 // 297mm at 96dpi

const SPLIT_STORAGE_KEY = 'rf_editor_split_percent'

function getInitialRightPanelPercent(): number {
  try {
    const stored = localStorage.getItem(SPLIT_STORAGE_KEY)
    if (stored) {
      const parsed = parseFloat(stored)
      if (!isNaN(parsed) && parsed >= 25 && parsed <= 75) return parsed
    }
  } catch {}
  return 55
}

export function EditorLayout() {
  const { resumeId } = useParams<{ resumeId: string }>()
  const { data: full, isLoading, error } = useFullResume(resumeId)
  const selectedTemplateId = useEditorUiStore((s) => s.getSelectedTemplate(resumeId ?? ''))
  const location = useLocation()

  // Full-width pages (Templates, AI Assistant, Export) use full width layout design
  const isFullWidthPage =
    location.pathname.endsWith('/templates') ||
    location.pathname.endsWith('/ai') ||
    location.pathname.endsWith('/export')

  // Resizable panel width state — defaults to 55% right preview panel / 45% left editor panel on load/reload
  const [rightPanelPercent, setRightPanelPercent] = useState<number>(getInitialRightPanelPercent)
  const [isResizing, setIsResizing] = useState<boolean>(false)
  const mainContentRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!mainContentRef.current) return
      const rect = mainContentRef.current.getBoundingClientRect()
      const rightPx = rect.right - moveEvent.clientX
      const rightPercent = (rightPx / rect.width) * 100
      // Clamp right panel percentage between 25% and 75%
      const clamped = Math.max(25, Math.min(75, rightPercent))
      setRightPanelPercent(clamped)
      try {
        localStorage.setItem(SPLIT_STORAGE_KEY, clamped.toString())
      } catch {}
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // "auto" fits the page to whatever width & height the preview panel actually has
  // right now (via ResizeObserver below) — this is the default, so the
  // page fits completely on screen without clipping regardless of window size.
  // A manual zoom value overrides auto-fit until the person clicks "Fit" again.
  const [zoom, setZoom] = useState<number | 'auto'>('auto')
  const [autoZoom, setAutoZoom] = useState(70)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = previewContainerRef.current
    if (!el) return
    const PADDING = 48 // px of breathing room (24px each side/top/bottom)
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const width = entry.contentRect.width ?? el.clientWidth
      const height = entry.contentRect.height ?? el.clientHeight
      const fitWidth = ((width - PADDING) / A4_WIDTH_PX) * 100
      const fitHeight = ((height - PADDING) / A4_HEIGHT_PX) * 100
      const fitted = Math.max(30, Math.min(150, Math.round(Math.min(fitWidth, fitHeight))))
      setAutoZoom(fitted)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const effectiveZoom = zoom === 'auto' ? autoZoom : zoom

  if (!resumeId) return null

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="w-56 shrink-0 border-r border-ink-100 bg-paper-50" />
        <div className="flex-1">
          <FullPageSpinner label="Loading your resume…" />
        </div>
      </div>
    )
  }

  if (error || !full) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <EmptyState
          icon={FileWarning}
          title="Couldn't load this resume"
          description={
            error instanceof ApiError
              ? error.message
              : "This resume may have been deleted, or you don't have access to it."
          }
          action={
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-500 transition-colors"
            >
              Go to Dashboard
            </Link>
          }
        />
      </div>
    )
  }

  const template = getTemplateById(selectedTemplateId)

  return (
    <>
      {/* Mobile Editor Layout Module (< xl screens) */}
      <MobileEditorLayout />

      {/* Desktop Editor Layout (xl screens and above) */}
      <div className="hidden h-screen flex-col overflow-hidden xl:flex">
        <TopBar
          right={
            <div className="flex min-w-0 items-center gap-3 px-2">
              <p className="hidden truncate font-display text-[15px] font-semibold text-ink-900 md:block">
                {full.resume.title || 'Untitled resume'}
              </p>
              <Link
                to={`/resumes/${resumeId}/export`}
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 sm:flex"
              >
                <Share2 className="h-[15px] w-[15px]" /> Share
              </Link>
              <Link
                to={`/resumes/${resumeId}/export`}
                className="flex items-center gap-1.5 rounded-lg bg-brass-500 px-3.5 py-2 text-sm font-medium text-paper-50 shadow-sm transition-colors hover:bg-brass-400"
              >
                <Download className="h-[15px] w-[15px]" /> <span className="hidden sm:inline">Download</span>
              </Link>
            </div>
          }
        />
        <div
          ref={mainContentRef}
          className={clsx('flex min-h-0 flex-1', isResizing && 'select-none cursor-col-resize')}
        >
          <EditorSidebar resumeId={resumeId} />

          <div
            className={clsx(
              'flex flex-1 overflow-y-auto scrollbar-thin bg-paper-100',
              isFullWidthPage ? 'p-6 lg:p-8' : 'justify-center min-w-[280px] p-4 sm:p-6',
            )}
          >
            <div className={clsx('w-full', isFullWidthPage ? 'max-w-7xl mx-auto' : 'max-w-2xl')}>
              <Outlet context={{ full, resumeId } satisfies EditorOutletContext} />
            </div>
          </div>

          {!isFullWidthPage && (
            <>
              {/* Resizable Divider Drag Handle */}
              <div
                onMouseDown={handleMouseDown}
                className="group relative hidden w-2 shrink-0 cursor-col-resize items-center justify-center bg-ink-200/80 transition-colors hover:bg-brass-500 active:bg-brass-600 xl:flex"
                title="Drag to resize panels"
              >
                <div className="h-8 w-1 rounded-full bg-ink-400 opacity-60 transition-opacity group-hover:bg-paper-50 group-hover:opacity-100" />
              </div>

              <div
                style={{ width: `${rightPanelPercent}%` }}
                className="hidden shrink-0 flex-col border-l border-ink-100 bg-paper-100 xl:flex"
              >
                <div ref={previewContainerRef} className="flex min-w-0 flex-1 items-center justify-center overflow-auto scrollbar-thin p-6">
                  <div
                    className="mx-auto"
                    style={{ width: `calc(210mm * ${effectiveZoom / 100})`, height: `calc(297mm * ${effectiveZoom / 100})` }}
                  >
                    <div
                      className="origin-top-left bg-white shadow-lg"
                      style={{ width: '210mm', height: '297mm', transform: `scale(${effectiveZoom / 100})` }}
                    >
                      <iframe
                        title="Resume preview"
                        sandbox="allow-same-origin"
                        srcDoc={template.render(full)}
                        className="pointer-events-none block h-[297mm] w-[210mm] border-0"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 border-t border-ink-100 bg-paper-50 py-2.5">
                  <button
                    onClick={() => setZoom(Math.max(30, effectiveZoom - 5))}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50"
                    aria-label="Zoom out"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-xs text-ink-600">{effectiveZoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(150, effectiveZoom + 5))}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50"
                    aria-label="Zoom in"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setZoom('auto')}
                    disabled={zoom === 'auto'}
                    className="ml-1 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-ink-50 disabled:text-brass-500"
                    title="Fit page to panel width"
                  >
                    <Maximize2 className="h-3 w-3" /> Fit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
