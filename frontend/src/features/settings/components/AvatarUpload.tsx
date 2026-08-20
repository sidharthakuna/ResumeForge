import { useRef, useState, useCallback } from 'react'
import { Camera, Trash2, Check, X, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useProfilePicture } from '@/features/settings/hooks/useProfilePicture'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface AvatarUploadProps {
  /** Current profile picture URL from the server (null = no photo yet). */
  currentUrl: string | null
  /** Fallback initials shown when no photo is set. */
  initials: string
  /** Optional size override (defaults to h-16 w-16). */
  size?: 'sm' | 'md' | 'lg'
  /** Called after a successful upload or removal with the new URL. */
  onProfilePictureChange?: (newUrl: string | null) => void
}

const sizeMap = {
  sm: 'h-12 w-12 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-24 w-24 text-2xl',
}

/**
 * AvatarUpload
 *
 * Circular avatar with a camera-icon overlay on hover. Clicking opens a
 * native file picker. The chosen image is previewed locally before
 * uploading — the user can confirm or cancel. After upload, shows a
 * "Remove photo" button to delete the picture.
 *
 * Validations (client-side mirror of the server rules):
 *  - MIME type must be image/jpeg | image/png | image/webp | image/gif
 *  - File size must be ≤ 5 MB
 */
export function AvatarUpload({
  currentUrl,
  initials,
  size = 'md',
  onProfilePictureChange,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  const { upload, remove, isUploading, isRemoving } = useProfilePicture()

  // ------------------------------------------------------------------ //
  //  File selection & preview                                            //
  // ------------------------------------------------------------------ //

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!e.target.files) return
    // Reset so selecting the same file again fires the change event.
    e.target.value = ''

    if (!file) return

    setValidationError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError('Please choose a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setValidationError('Image must be smaller than 5 MB.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setPendingFile(file)
  }, [])

  const cancelPreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPendingFile(null)
    setValidationError(null)
  }, [previewUrl])

  // ------------------------------------------------------------------ //
  //  Upload confirm                                                      //
  // ------------------------------------------------------------------ //

  const confirmUpload = useCallback(() => {
    if (!pendingFile) return
    upload(pendingFile)
    // Clear preview — the live URL from the server will update via the hook.
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPendingFile(null)
    setImgError(false)
    setCacheBust(Date.now())
    onProfilePictureChange?.(null) // Will be updated via query invalidation.
  }, [pendingFile, previewUrl, upload, onProfilePictureChange])

  // ------------------------------------------------------------------ //
  //  Remove                                                              //
  // ------------------------------------------------------------------ //

  const handleRemove = useCallback(() => {
    remove()
    setImgError(false)
    setCacheBust(Date.now())
    onProfilePictureChange?.(null)
  }, [remove, onProfilePictureChange])

  // ------------------------------------------------------------------ //
  //  Render                                                              //
  // ------------------------------------------------------------------ //

  const [cacheBust, setCacheBust] = useState(Date.now())

  const isLoading = isUploading || isRemoving
  
  // Append cacheBust to currentUrl so that the browser re-fetches it
  const urlWithCacheBust = currentUrl ? `${currentUrl}?t=${cacheBust}` : null
  const displayUrl = previewUrl ?? (imgError ? null : urlWithCacheBust)
  const hasPhoto = !!displayUrl

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {/* Avatar circle */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => !isLoading && fileInputRef.current?.click()}
            disabled={isLoading}
            className={clsx(
              'group relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
              sizeMap[size],
              hasPhoto ? '' : 'bg-brass-500 font-display font-semibold text-paper-50',
              'ring-2 ring-transparent transition-all hover:ring-brass-400 focus-visible:outline-none focus-visible:ring-brass-400',
              isLoading && 'cursor-not-allowed opacity-70',
            )}
            aria-label="Change profile picture"
            title="Click to change profile picture"
          >
            {hasPhoto ? (
              <img
                src={displayUrl}
                alt="Profile picture"
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span aria-hidden>{initials}</span>
            )}

            {/* Camera overlay on hover */}
            {!isLoading && (
              <span
                className={clsx(
                  'absolute inset-0 flex items-center justify-center rounded-full',
                  'bg-ink-950/50 opacity-0 transition-opacity group-hover:opacity-100',
                )}
                aria-hidden
              >
                <Camera className="h-5 w-5 text-paper-50 drop-shadow" />
              </span>
            )}

            {/* Loading spinner overlay */}
            {isLoading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-950/60">
                <Loader2 className="h-5 w-5 animate-spin text-paper-50" />
              </span>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Upload profile picture"
            id="avatar-file-input"
          />
        </div>

        {/* Name + role + action buttons */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-ink-900">{/* filled by parent */}</p>

          {/* Preview confirm / cancel row */}
          {previewUrl && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={confirmUpload}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                Save photo
              </button>
              <button
                type="button"
                onClick={cancelPreview}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-60"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          )}

          {/* Upload / remove row (when no preview is pending) */}
          {!previewUrl && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-60"
              >
                <Camera className="h-3.5 w-3.5" />
                {currentUrl && !imgError ? 'Change photo' : 'Upload photo'}
              </button>

              {currentUrl && !imgError && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 rounded-lg border border-danger-200 px-3 py-1.5 text-xs font-medium text-danger-600 hover:bg-danger-50 disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-600" role="alert">
          {validationError}
        </p>
      )}

      <p className="text-xs text-ink-400">
        JPEG, PNG, WebP or GIF · Max 5 MB · Click the circle to change
      </p>
    </div>
  )
}
