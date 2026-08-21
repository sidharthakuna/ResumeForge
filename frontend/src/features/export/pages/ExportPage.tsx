import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download,
  FileDown,
  Clock,
  RotateCcw,
  Save,
  Minus,
  Plus,
  History,
  Edit2,
  Bold,
  Italic,
  List,
  Undo,
  Redo,
  Layers,
  ArrowUpRight,
  X,
  Printer,
  Copy,
  Check,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { getTemplateById } from '@/features/templates/renderers/registry'
import {
  useGeneratedResumes,
  useGenerateFromHtml,
  useDownloadGeneratedResume,
  useDeleteGeneratedResume,
} from '../api/export.hooks'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { toast } from 'sonner'
import '@/features/export/styles/exportStudio.css'

export default function ExportPage() {
  const navigate = useNavigate()
  const { full, resumeId } = useEditorContext()
  const selectedTemplateId = useEditorUiStore((s) => s.getSelectedTemplate(resumeId))
  const template = getTemplateById(selectedTemplateId)

  const { data: history, isLoading: historyLoading } = useGeneratedResumes(resumeId)
  const generateMutation = useGenerateFromHtml(resumeId)
  const downloadMutation = useDownloadGeneratedResume()
  const deleteMutation = useDeleteGeneratedResume(resumeId)

  // On-Paper Editing State
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  // Default to 70% zoom so all parts of the A4 sheet are visible at first glance
  const [zoom, setZoom] = useState<number>(70)
  const [showHistory, setShowHistory] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Storage key for paper edits
  const storageKey = `rf_paper_edits_${resumeId}_${selectedTemplateId}`

  // Extract clean sanitized HTML from iframe
  const extractCleanHtml = useCallback((): string => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document
    if (doc && doc.documentElement) {
      const cloneDoc = doc.documentElement.cloneNode(true) as HTMLElement

      // Remove injected editor-only interactive styles
      const injectedStyle = cloneDoc.querySelector('#rf-editor-injected-style')
      if (injectedStyle) {
        injectedStyle.remove()
      }

      // Remove contenteditable & spellcheck from all elements
      cloneDoc.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'))
      cloneDoc.querySelectorAll('[spellcheck]').forEach((el) => el.removeAttribute('spellcheck'))

      const body = cloneDoc.querySelector('body')
      if (body) {
        body.removeAttribute('contenteditable')
        body.removeAttribute('spellcheck')
      }
      return '<!DOCTYPE html>\n' + cloneDoc.outerHTML
    }
    return template.render(full)
  }, [template, full])

  // Load HTML content into iframe and enable on-paper editing
  const loadIframeContent = useCallback((htmlString: string) => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    doc.open()
    doc.write(htmlString)
    doc.close()

    // Inject live on-paper styling & focus indicators
    const styleEl = doc.createElement('style')
    styleEl.id = 'rf-editor-injected-style'
    styleEl.innerHTML = `
      * {
        transition: background-color 0.12s ease, outline 0.12s ease;
      }
      *:focus {
        outline: 1.5px dashed #4f46e5 !important;
        outline-offset: 2px !important;
        background-color: rgba(79, 70, 229, 0.04) !important;
      }
      body {
        cursor: text !important;
      }
    `
    doc.head.appendChild(styleEl)

    // Direct on-paper editing
    doc.body.contentEditable = 'true'
    doc.designMode = 'on'

    doc.body.addEventListener('input', () => {
      setHasUnsavedEdits(true)
    })
  }, [])

  // Initial load: check for saved paper edits in localStorage or render fresh template
  useEffect(() => {
    let initialHtml = ''
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        initialHtml = saved
        setLastSavedTime('Saved edits loaded')
      }
    } catch {}

    if (!initialHtml) {
      initialHtml = template.render(full)
    }

    loadIframeContent(initialHtml)
    setHasUnsavedEdits(false)
  }, [storageKey, template, full, loadIframeContent])

  // Formatting helpers for on-paper editor
  const applyFormat = (command: string, value?: string) => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document
    if (doc) {
      doc.execCommand(command, false, value)
      setHasUnsavedEdits(true)
    }
  }

  // Save Changes button handler
  const handleSaveChanges = useCallback(() => {
    const cleanHtml = extractCleanHtml()
    try {
      localStorage.setItem(storageKey, cleanHtml)
      setHasUnsavedEdits(false)
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setLastSavedTime(`Saved at ${timeStr}`)
      toast.success('Changes saved')
    } catch {
      toast.error('Failed to save changes')
    }
  }, [extractCleanHtml, storageKey])

  // Keyboard shortcut Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSaveChanges()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSaveChanges])

  // Reset to original structured resume data
  const handleResetToOriginal = () => {
    try {
      localStorage.removeItem(storageKey)
    } catch {}
    const freshHtml = template.render(full)
    loadIframeContent(freshHtml)
    setHasUnsavedEdits(false)
    setLastSavedTime(null)
    toast.success('Reset to original data')
  }

  // Export & Download PDF
  const handleExport = () => {
    const finalHtml = extractCleanHtml()

    try {
      localStorage.setItem(storageKey, finalHtml)
      setHasUnsavedEdits(false)
    } catch {}

    generateMutation.mutate({ html: finalHtml, templateName: template.name })
  }

  // Browser print dialog
  const handlePrint = () => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    }
  }

  // Copy plain text to clipboard for job boards
  const handleCopyText = () => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document
    if (doc?.body) {
      const text = doc.body.innerText
      navigator.clipboard.writeText(text)
      setCopiedText(true)
      toast.success('Resume plain text copied to clipboard!')
      setTimeout(() => setCopiedText(false), 2000)
    }
  }

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteMutation.mutate(id)
  }

  return (
    <div className="export-studio-container space-y-4">
      {/* Top Header Bar */}
      <div className="export-top-banner flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-ink-900">
              Document Preview & Export
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-ink-500">
              • Press <kbd className="rounded border border-ink-200 bg-paper-100 px-1 py-0.2 font-mono text-[10px] text-ink-600">Ctrl+S</kbd> to save
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-ink-500">
            Click directly on any text on the page to make edits before exporting.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="export-top-btn export-top-btn-print"
            title="Print document directly"
          >
            <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 dark:text-slate-400" />
            <span>Print</span>
          </button>

          {/* Edit in Section Builder */}
          <button
            type="button"
            onClick={() => navigate(`/resumes/${resumeId}/edit/personal`)}
            className="export-top-btn export-top-btn-sections"
            title="Switch to section-by-section editor"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Sections</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={generateMutation.isPending || (downloadMutation.isPending && downloadMutation.variables === generateMutation.data?.generatedResumeId)}
            className="export-top-btn export-top-btn-download"
          >
            {generateMutation.isPending || downloadMutation.isPending ? (
              <>
                <Spinner className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Exporting…</span>
              </>
            ) : (
              <>
                <FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main A4 Live Paper Sheet Stage */}
      <div className="export-paper-stage flex flex-col overflow-hidden">
        {/* Paper Canvas Subheader Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-ink-200/80 bg-paper-50/90 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-medium dark:border-slate-800 dark:bg-slate-900/90">
          {/* Active Template & Formatting Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-800 dark:text-slate-200">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>{template.name}</span>
            </div>

            {/* Text Formatting Controls */}
            <div className="hidden sm:flex items-center gap-0.5 border-l border-ink-200 pl-2 dark:border-slate-800">
              <button
                type="button"
                onClick={() => applyFormat('bold')}
                className="rounded p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat('italic')}
                className="rounded p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat('insertUnorderedList')}
                className="rounded p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                title="Bullet List"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat('undo')}
                className="rounded p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyFormat('redo')}
                className="rounded p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right Tools: Copy Text & Zoom Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Copy Plain Text for Job Boards */}
            <button
              type="button"
              onClick={handleCopyText}
              className="hidden sm:flex items-center gap-1 rounded px-2 py-1 text-[11px] text-ink-600 hover:bg-ink-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              title="Copy plain text for job applications"
            >
              {copiedText ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-ink-400" />}
              <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-l border-ink-200 pl-1.5 sm:pl-2 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(30, z - 5))}
                className="rounded p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-slate-800 cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
              <span className="w-7 sm:w-8 text-center font-mono text-[10px] sm:text-[11px] text-ink-600 dark:text-slate-300">
                {zoom}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(130, z + 5))}
                className="rounded p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-slate-800 cursor-pointer"
                title="Zoom In"
              >
                <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(70)}
                className="ml-0.5 sm:ml-1 rounded px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer"
              >
                Fit
              </button>
            </div>
          </div>
        </div>

        {/* Paper Canvas */}
        <div className="flex items-start justify-center overflow-auto p-2.5 sm:p-6 scrollbar-thin min-h-[440px] sm:min-h-[760px]">

          <div
            style={{
              width: `calc(210mm * ${zoom / 100})`,
              height: `calc(297mm * ${zoom / 100})`,
            }}
            className="relative transition-all duration-150"
          >
            <div
              style={{
                width: '210mm',
                height: '297mm',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
              }}
              className="origin-top-left bg-white export-paper-shadow overflow-hidden"
            >
              <iframe
                ref={iframeRef}
                title="Resume Paper"
                sandbox="allow-same-origin"
                className="block h-[297mm] w-[210mm] border-0 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Glassmorphic 4-Action Dock (Centered Below Resume) */}
      <div className="export-dock-container mx-auto w-full max-w-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Reset Button */}
          <button
            type="button"
            onClick={handleResetToOriginal}
            className="export-btn-base export-btn-reset w-full"
            title="Reset paper to structured resume data"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>

          {/* 2. History Button */}
          <button
            type="button"
            onClick={() => setShowHistory((h) => !h)}
            className={`export-btn-base export-btn-history w-full ${showHistory ? 'active' : ''}`}
          >
            <History className="h-4 w-4" />
            <span>History</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              showHistory
                ? 'bg-white/20 text-white'
                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
            }`}>
              {history?.length || 0}
            </span>
          </button>

          {/* 3. Save Changes Button */}
          <button
            type="button"
            onClick={handleSaveChanges}
            className={`export-btn-base w-full ${
              hasUnsavedEdits ? 'export-btn-unsaved' : 'export-btn-saved'
            }`}
          >
            {hasUnsavedEdits ? (
              <>
                <Save className="h-4 w-4" />
                <span>Save *</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>{lastSavedTime || 'Saved'}</span>
              </>
            )}
          </button>

          {/* 4. Download PDF Hero CTA */}
          <button
            type="button"
            onClick={handleExport}
            disabled={generateMutation.isPending || (downloadMutation.isPending && downloadMutation.variables === generateMutation.data?.generatedResumeId)}
            className="export-btn-base export-btn-download w-full"
          >
            {generateMutation.isPending || downloadMutation.isPending ? (
              <>
                <Spinner className="h-4 w-4" />
                <span>Exporting…</span>
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Past Exports Drawer (Removable with Delete Cross) */}
      {showHistory && (
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-ink-200 bg-paper-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-ink-100 pb-2 mb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-ink-900">Past Generated PDFs</span>
              <span className="rounded-full bg-ink-100 px-2 py-0.2 text-[10px] font-bold text-ink-600 dark:bg-slate-800 dark:text-slate-300">
                {history?.length || 0}
              </span>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-slate-800 cursor-pointer"
              title="Close history"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {historyLoading ? (
            <Spinner label="Loading history…" />
          ) : !history || history.length === 0 ? (
            <p className="text-xs text-ink-400 text-center py-4">No past exports yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto scrollbar-thin">
              {history.map((gr) => (
                <div
                  key={gr.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-ink-200 bg-paper-100/70 p-2.5 text-xs transition-colors hover:border-ink-300 dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{gr.frontendTemplateName || 'PDF Export'}</p>
                    <p className="text-[10px] text-ink-400">{formatDistanceToNow(new Date(gr.generatedAt), { addSuffix: true })}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadMutation.mutate(gr.id)}
                      loading={downloadMutation.isPending && downloadMutation.variables === gr.id}
                      className="h-7 text-[11px] px-2.5 gap-1 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 border-ink-200 dark:border-slate-700"
                      title="Download PDF"
                    >
                      <Download className="h-3 w-3" />
                      <span>PDF</span>
                    </Button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoryItem(e, gr.id)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === gr.id}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-200 bg-paper-50 text-ink-400 hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-700 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove from history"
                      aria-label="Remove from history"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Document Details Footer */}
      <div className="mx-auto w-full max-w-2xl grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="export-spec-card">
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">Format</span>
          <p className="mt-0.5 text-xs font-semibold text-ink-800 dark:text-slate-200">PDF Document</p>
        </div>
        <div className="export-spec-card">
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">Size</span>
          <p className="mt-0.5 text-xs font-semibold text-ink-800 dark:text-slate-200">A4 (210 × 297 mm)</p>
        </div>
        <div className="export-spec-card">
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">Quality</span>
          <p className="mt-0.5 text-xs font-semibold text-ink-800 dark:text-slate-200">Vector 300 DPI</p>
        </div>
        <div className="export-spec-card">
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">Template</span>
          <button
            onClick={() => navigate(`/resumes/${resumeId}/templates`)}
            className="mt-0.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span className="truncate">{template.name}</span>
            <ArrowUpRight className="h-3 w-3 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  )
}
