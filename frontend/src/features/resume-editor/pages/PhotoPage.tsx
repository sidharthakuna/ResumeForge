import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { useAddPersonalInfo, useUpdatePersonalInfo } from '@/features/resume-editor/api/personal-info.hooks'
import {
  Camera,
  Upload,
  Link as LinkIcon,
  Trash2,
  CheckCircle2,
  User,
  ArrowRight,
  ArrowLeft,
  Info,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { getTemplateById, templateSupportsPhoto } from '@/features/templates/renderers/registry'
import type { FullResumeResponse } from '@/types/api'

// High-fidelity image compressor & square cropper via client-side canvas
async function compressAndCropSquare(file: File, maxDim: number = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const img = new Image()

    reader.onload = (e) => {
      if (!e.target?.result) return reject(new Error('Failed to read file'))
      img.src = e.target.result as string
    }

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D context not available'))

      const minSide = Math.min(img.width, img.height)
      const cropX = (img.width - minSide) / 2
      const cropY = (img.height - minSide) / 2

      const targetDim = Math.min(minSide, maxDim)
      canvas.width = targetDim
      canvas.height = targetDim

      ctx.drawImage(
        img,
        cropX,
        cropY,
        minSide,
        minSide,
        0,
        0,
        targetDim,
        targetDim
      )

      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }

    img.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PhotoPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const selectedTemplateId = useEditorUiStore((s) => s.getSelectedTemplate(resumeId))
  const template = getTemplateById(selectedTemplateId)
  const supportsPhoto = templateSupportsPhoto(template)

  const addMutation = useAddPersonalInfo(resumeId)
  const updateMutation = useUpdatePersonalInfo(resumeId)
  const isSaving = addMutation.isPending || updateMutation.isPending

  const [currentPhoto, setCurrentPhoto] = useState<string | null>(
    full.personalInfo?.photoUrl ?? null
  )
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keep local state aligned with context data
  useEffect(() => {
    setCurrentPhoto(full.personalInfo?.photoUrl ?? null)
  }, [full.personalInfo?.photoUrl])

  // Save photo and update TanStack Query cache optimistically
  const handleSave = async (targetPhoto: string | null = currentPhoto) => {
    const baseInfo = full.personalInfo ?? {
      id: '',
      fullName: 'Your Name',
      email: 'user@example.com',
      jobTitle: null,
      phone: null,
      location: null,
      linkedinUrl: null,
      githubUrl: null,
      portfolioUrl: null,
      photoUrl: null,
    }

    const payload = {
      fullName: baseInfo.fullName || 'Your Name',
      jobTitle: baseInfo.jobTitle,
      email: baseInfo.email || 'user@example.com',
      phone: baseInfo.phone,
      location: baseInfo.location,
      linkedinUrl: baseInfo.linkedinUrl,
      githubUrl: baseInfo.githubUrl,
      portfolioUrl: baseInfo.portfolioUrl,
      photoUrl: targetPhoto,
    }

    // 1. Optimistically update local query cache for instant live preview response
    qc.setQueryData<FullResumeResponse>(queryKeys.resume.full(resumeId), (old) => {
      if (!old) return old
      return {
        ...old,
        personalInfo: old.personalInfo
          ? { ...old.personalInfo, photoUrl: targetPhoto }
          : { ...payload, id: 'temp-id' },
      }
    })

    // 2. Persist to backend
    try {
      if (full.personalInfo && full.personalInfo.id) {
        await updateMutation.mutateAsync({ id: full.personalInfo.id, body: payload })
      } else {
        await addMutation.mutateAsync(payload)
      }
      setCurrentPhoto(targetPhoto)
    } catch {
      // Handled by hook error toast
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, or WebP).')
      return
    }

    try {
      setIsProcessing(true)
      const compressedDataUrl = await compressAndCropSquare(file)
      setCurrentPhoto(compressedDataUrl)
      await handleSave(compressedDataUrl)
      toast.success('Photo uploaded and applied to resume preview!')
    } catch {
      toast.error('Could not process the image. Please try another file.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleRemove = async () => {
    setCurrentPhoto(null)
    await handleSave(null)
    toast.success('Photo removed from resume.')
  }

  const applyUrl = async () => {
    if (!urlInput.trim()) return
    const url = urlInput.trim()
    setCurrentPhoto(url)
    setShowUrlInput(false)
    setUrlInput('')
    await handleSave(url)
    toast.success('Photo URL applied!')
  }

  return (
    <div className="mx-auto max-w-3xl px-3.5 py-4 sm:px-6 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <SectionHeader
        title="Resume Profile Photo"
        description="Add a high-resolution portrait for photo-enabled designs (such as Emerald Sidebar)."
        icon={Camera}
        colorTone="emerald"
      />

      {!supportsPhoto && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3 sm:p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          <Info className="h-4.5 w-4.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold">Photo is not displayed in &ldquo;{template.name}&rdquo;</p>
            <p className="text-amber-700 dark:text-amber-300">
              The template you currently have active ({template.name}) does not include a profile photo. If you would like your photo displayed, you can switch to a photo-supported design (such as <strong>Emerald Sidebar</strong> or <strong>Visionary</strong>) in the Templates tab.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate(`/resumes/${resumeId}/templates`)}
                className="font-semibold underline hover:text-amber-950 dark:hover:text-white"
              >
                Browse Photo Templates &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Card */}
      <Card className="border-ink-100 shadow-sm overflow-hidden">
        <CardBody className="p-4 sm:p-8 space-y-5 sm:space-y-8">
          
          {/* Top Showcase: Live Circular Stage */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 rounded-2xl bg-paper-50 p-4 sm:p-6 border border-ink-100/80">
            {/* The Avatar Stage */}
            <div className="relative group">
              <div className="relative flex h-24 w-24 sm:h-36 sm:w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border-3 sm:border-4 border-emerald-600 bg-emerald-950 shadow-xl ring-3 sm:ring-4 ring-emerald-500/20 transition-all group-hover:scale-105">
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Resume Profile Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-emerald-300">
                    <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 opacity-60" />
                    <span className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase opacity-75">No Photo</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white backdrop-blur-xs">
                    <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-900/90 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400 shadow-md backdrop-blur-xs flex items-center gap-1 border border-emerald-500/30">
                {currentPhoto ? (
                  <>
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" /> Active in Preview
                  </>
                ) : (
                  'Placeholder Used'
                )}
              </div>
            </div>

            {/* Quick Actions & Meta */}
            <div className="flex-1 text-center sm:text-left space-y-2.5 sm:space-y-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-ink-900">
                  {currentPhoto ? 'Custom Resume Portrait Active' : 'No Portrait Attached'}
                </h3>
                <p className="text-xs text-ink-500 mt-0.5 sm:mt-1 leading-normal">
                  {currentPhoto
                    ? 'Your photo is synchronized with the live preview and ready for PDF generation.'
                    : 'Templates with photo support will display your initials until a photo is uploaded.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 font-semibold h-8.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{currentPhoto ? 'Replace Photo' : 'Upload Image'}</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="gap-1.5 text-xs h-8.5"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Paste URL</span>
                </Button>

                {currentPhoto && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemove}
                    disabled={isSaving}
                    className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30 h-8.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* URL Input Form (if toggled) */}
          {showUrlInput && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-2">
              <div className="text-xs font-semibold text-ink-800">Paste direct image link (HTTPS):</div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="text-xs h-9"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={applyUrl}
                  loading={isSaving}
                  className="h-9 text-xs shrink-0 bg-emerald-600 hover:bg-emerald-500"
                >
                  Apply URL
                </Button>
              </div>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0])
              }
            }}
          />

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 sm:p-8 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 scale-[0.99]'
                : 'border-ink-200 hover:border-emerald-500 hover:bg-paper-50'
            }`}
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform dark:bg-emerald-950/80 dark:text-emerald-400 shadow-xs">
              <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm font-semibold text-ink-800">
              Click to browse or drop an image here
            </p>
            <p className="text-[11px] sm:text-xs text-ink-400 mt-0.5 sm:mt-1">
              Supports JPG, PNG, WebP • Auto-crops &amp; optimizes for crisp circular framing
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-2.5 pt-4 sm:pt-6 border-t border-ink-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/resumes/${resumeId}/edit/personal`)}
              className="gap-1 text-xs text-ink-600 hover:text-ink-900 h-9 px-3"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={isSaving}
              onClick={async () => {
                await handleSave()
                navigate(`/resumes/${resumeId}/edit/education`)
              }}
              className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs font-semibold rounded-xl text-xs sm:text-sm h-9 px-4"
            >
              Save &amp; Continue <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
