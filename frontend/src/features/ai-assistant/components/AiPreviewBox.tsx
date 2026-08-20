import { useState } from 'react'
import { Check, Edit3, RotateCw, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'

interface AiPreviewBoxProps {
  title?: string
  content: string | string[]
  badgeLabel?: string
  focusNote?: string
  matchedSkills?: string[]
  onApply: (finalContent: string | string[]) => void
  onRegenerate?: () => void
  onDiscard?: () => void
  isApplying?: boolean
  isRegenerating?: boolean
  className?: string
}

export function AiPreviewBox({
  title = 'AI Generated Content',
  content,
  badgeLabel = 'Tailored Preview',
  focusNote,
  matchedSkills = [],
  onApply,
  onRegenerate,
  onDiscard,
  isApplying = false,
  isRegenerating = false,
  className = '',
}: AiPreviewBoxProps) {
  const isArray = Array.isArray(content)
  const initialText = isArray ? (content as string[]).join('\n\n') : (content as string)

  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(initialText)

  const handleApply = () => {
    if (isArray) {
      const bullets = editedText
        .split('\n')
        .map((b) => b.trim())
        .filter((b) => b.length > 0)
        .map((b) => (b.startsWith('•') || b.startsWith('-') || b.startsWith('*') ? b.substring(1).trim() : b))
      onApply(bullets)
    } else {
      onApply(editedText.trim())
    }
  }

  return (
    <div className={`ai-preview-box ${className}`}>
      <div className="ai-preview-header">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h4 className="ai-preview-header-title">
            {title}
          </h4>
        </div>
        <Badge tone="indigo" className="text-[10px] uppercase font-bold">
          {badgeLabel}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        {focusNote && (
          <p className="ai-preview-focus">
            ✦ {focusNote}
          </p>
        )}

        {isEditing ? (
          <div>
            <Textarea
              rows={isArray ? 6 : 4}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="ai-textarea font-sans text-sm leading-relaxed"
              placeholder="Edit AI generated text here..."
            />
            <p className="mt-1 text-[11px] text-ink-500 dark:text-ink-400">
              {isArray ? 'Separate distinct bullet points with a new line.' : 'Edit text before applying.'}
            </p>
          </div>
        ) : (
          <div className="ai-preview-content-box">
            {isArray ? (
              <ul className="space-y-2">
                {(content as string[]).map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm leading-relaxed text-ink-900 font-medium">
                    <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ai-preview-text">
                {editedText || content}
              </p>
            )}
          </div>
        )}

        {matchedSkills && matchedSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-bold text-ink-900">Aligned Keywords:</span>
            {matchedSkills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="ai-preview-chip"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isEditing ? 'secondary' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isEditing ? 'Preview Mode' : 'Edit Text'}
            </Button>

            {onRegenerate && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRegenerate}
                loading={isRegenerating}
                className="gap-1.5 text-xs font-semibold"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onDiscard && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDiscard}
                className="gap-1 text-xs text-ink-600 hover:text-ink-900 dark:text-ink-400 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                Discard
              </Button>
            )}

            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="ai-btn-primary text-xs"
            >
              <Check className="h-3.5 w-3.5" />
              Apply to Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
