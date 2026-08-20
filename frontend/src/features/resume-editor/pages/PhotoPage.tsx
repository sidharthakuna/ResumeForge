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
  Trash2,
  Link as LinkIcon,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import type { FullResumeResponse } from '@/types/api'

/**
 * Smart square crop and auto-compression utility to ensure fast loading,
 * crisp circular rendering, and tiny payload size (~40KB) without HTTP 413 limits.
 */
function compressAndCropSquare(file: File, size = 512, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = reject

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context unavailable'))
        return
      }

      // Calculate square center crop dimensions
      const minDimension = Math.min(img.width, img.height)
      const srcX = (img.width - minDimension) / 2
      const srcY = (img.height - minDimension) / 2

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, srcX, srcY, minDimension, minDimension, 0, 0, size, size)

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedDataUrl)
    }

    img.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PhotoPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const qc = useQueryClient()

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
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
      {/* Header */}
      <SectionHeader
        title="Resume Profile Photo"
        description="Add a high-resolution portrait for photo-enabled designs (such as Emerald Sidebar)."
        icon={Camera}
        colorTone="emerald"
      />

      {/* Main Studio Card */}
      <Card className="border-ink-100 shadow-sm overflow-hidden">
        <CardBody className="p-6 sm:p-8 space-y-8">
          
          {/* Top Showcase: Live Circular Stage */}
          <div className="flex flex-col sm:flex-row items-center gap-8 rounded-2xl bg-paper-50 p-6 border border-ink-100/80">
            {/* The Avatar Stage */}
            <div className="relative group">
              <div className="relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-emerald-600 bg-emerald-950 shadow-xl ring-4 ring-emerald-500/20 transition-all group-hover:scale-105">
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Resume Profile Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-emerald-300">
                    <ImageIcon className="h-10 w-10 opacity-60" />
                    <span className="mt-1 text-[11px] font-semibold tracking-wide uppercase opacity-75">No Photo</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white backdrop-blur-xs">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-900/90 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 shadow-md backdrop-blur-xs flex items-center gap-1 border border-emerald-500/30">
                {currentPhoto ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Active in Preview
                  </>
                ) : (
                  'Placeholder Used'
                )}
              </div>
            </div>

            {/* Quick Actions & Meta */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h3 className="text-base font-bold text-ink-900">
                  {currentPhoto ? 'Custom Resume Portrait Active' : 'No Portrait Attached'}
                </h3>
                <p className="text-xs text-ink-500 mt-1 leading-normal">
                  {currentPhoto
                    ? 'Your photo is synchronized with the live preview and ready for PDF generation.'
                    : 'Templates with photo support (e.g. Emerald Sidebar) will display your initials until a photo is uploaded.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 font-semibold"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{currentPhoto ? 'Replace Photo' : 'Upload Image'}</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="gap-1.5 text-xs"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Paste Image URL</span>
                </Button>

                {currentPhoto && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemove}
                    disabled={isSaving}
                    className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
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
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 scale-[0.99]'
                : 'border-ink-200 hover:border-emerald-500 hover:bg-paper-50'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform dark:bg-emerald-950/80 dark:text-emerald-400 shadow-xs">
              <Upload className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-800">
              Click to browse or drop an image here
            </p>
            <p className="text-xs text-ink-400 mt-1">
              Supports JPG, PNG, WebP • Auto-crops &amp; optimizes for crisp circular framing
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-6 border-t border-ink-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/resumes/${resumeId}/edit/personal`)}
              className="gap-1.5 text-xs text-ink-600 hover:text-ink-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Previous: Personal
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={isSaving}
              onClick={async () => {
                await handleSave()
                navigate(`/resumes/${resumeId}/edit/education`)
              }}
              className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs font-semibold rounded-xl"
            >
              Save &amp; Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
