import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Plus, X, ArrowRight, Sparkles, GripVertical, ChevronUp, ChevronDown, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { useUpdateResume } from '@/features/resume-editor/hooks/useResume'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { clsx } from 'clsx'

const PRESET_STRENGTHS = [
  'Strong problem-solving mindset',
  'Quick learner and self-motivated',
  'Team collaboration and adaptability',
  'Attention to detail',
  'Commitment to continuous improvement',
  'Excellent analytical skills',
  'Strong communication skills',
  'Effective time management',
]

export default function StrengthsPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const updateMutation = useUpdateResume(resumeId)

  // Parse existing strengths string (stored as newline-separated text) into an array
  const initialStrengths = (full.resume.strengths ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const [strengths, setStrengths] = useState<string[]>(
    initialStrengths.length > 0 ? initialStrengths : PRESET_STRENGTHS.slice(0, 5)
  )
  const [newStrength, setNewStrength] = useState('')
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [draggedPreset, setDraggedPreset] = useState<string | null>(null)
  const [isCardDropTarget, setIsCardDropTarget] = useState(false)
  const [isSuggestionsDropTarget, setIsSuggestionsDropTarget] = useState(false)

  function handleAdd() {
    const trimmed = newStrength.trim()
    if (trimmed && !strengths.includes(trimmed)) {
      setStrengths([...strengths, trimmed])
      setNewStrength('')
    }
  }

  function handleRemove(index: number) {
    setStrengths(strengths.filter((_, i) => i !== index))
  }

  function handleAddPreset(preset: string) {
    if (!strengths.includes(preset)) {
      setStrengths([...strengths, preset])
    }
  }

  function handleMoveUp(index: number) {
    if (index <= 0) return
    const reordered = [...strengths]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(index - 1, 0, moved)
    setStrengths(reordered)
  }

  function handleMoveDown(index: number) {
    if (index >= strengths.length - 1) return
    const reordered = [...strengths]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(index + 1, 0, moved)
    setStrengths(reordered)
  }

  function handleDragStart(index: number, e: React.DragEvent) {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'copyMove'
    e.dataTransfer.setData('text/plain', `${index}`)
    e.dataTransfer.setData('strength-index', `${index}`)
    e.dataTransfer.setData('strength-text', strengths[index])
  }

  function handleDragOver(index: number, e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = draggedPreset ? 'copy' : 'move'
    if (dragOverIdx !== index) {
      setDragOverIdx(index)
    }
  }

  function handleDrop(index: number, e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()

    // Case 1: Dragging a quick suggestion preset directly into position `index`
    if (draggedPreset) {
      const filtered = strengths.filter((s) => s !== draggedPreset)
      const targetIdx = Math.min(index, filtered.length)
      filtered.splice(targetIdx, 0, draggedPreset)
      setStrengths(filtered)
      setDraggedPreset(null)
      setDragOverIdx(null)
      setIsCardDropTarget(false)
      return
    }

    // Case 2: Reordering existing strength
    let sourceIdx = draggedIdx
    const rawIdx = e.dataTransfer.getData('strength-index') || e.dataTransfer.getData('text/plain')
    if (sourceIdx === null && rawIdx && !isNaN(Number(rawIdx))) {
      sourceIdx = Number(rawIdx)
    }

    if (sourceIdx === null || sourceIdx === index) {
      setDraggedIdx(null)
      setDragOverIdx(null)
      return
    }
    const reordered = [...strengths]
    const [moved] = reordered.splice(sourceIdx, 1)
    reordered.splice(index, 0, moved)
    setStrengths(reordered)
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  function handleCardDrop(e: React.DragEvent) {
    e.preventDefault()
    if (draggedPreset) {
      if (!strengths.includes(draggedPreset)) {
        setStrengths([...strengths, draggedPreset])
      }
      setDraggedPreset(null)
      setDragOverIdx(null)
      setIsCardDropTarget(false)
    }
  }

  function handleSuggestionsDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    let targetIndex = draggedIdx
    const rawIdx = e.dataTransfer.getData('strength-index') || e.dataTransfer.getData('text/plain')
    if (targetIndex === null && rawIdx && !isNaN(Number(rawIdx))) {
      targetIndex = Number(rawIdx)
    }

    if (targetIndex !== null && targetIndex >= 0 && targetIndex < strengths.length) {
      const removedItem = strengths[targetIndex]
      setStrengths((prev) => prev.filter((_, i) => i !== targetIndex))
      toast.success(`Removed "${removedItem}" from strengths`)
    }
    setDraggedIdx(null)
    setDragOverIdx(null)
    setDraggedPreset(null)
    setIsSuggestionsDropTarget(false)
  }

  function handleDragEnd() {
    setDraggedIdx(null)
    setDragOverIdx(null)
    setDraggedPreset(null)
    setIsCardDropTarget(false)
    setIsSuggestionsDropTarget(false)
  }

  function handleSave() {
    const strengthsText = strengths.join('\n')
    updateMutation.mutate(
      {
        title: full.resume.title,
        summary: full.resume.summary,
        declaration: full.resume.declaration,
        strengths: strengthsText || null,
      },
      {
        onSuccess: () => {
          navigate(`/resumes/${resumeId}/edit/languages`)
        },
      }
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="Strengths & Soft Skills"
        description="Key personal strengths, work ethics, and soft skills that highlight your potential."
        icon={Flame}
        colorTone="amber"
      />

      <div className="space-y-6">
        <Card
          onDragOver={(e) => {
            if (draggedPreset) {
              e.preventDefault()
              setIsCardDropTarget(true)
            }
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsCardDropTarget(false)
            }
          }}
          onDrop={handleCardDrop}
          className={clsx(
            'transition-all duration-200',
            isCardDropTarget && draggedPreset && 'ring-2 ring-amber-500/40 border-amber-500 bg-amber-500/5'
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">Your Strengths ({strengths.length})</h3>
              <span className="strength-badge">
                <Flame className="h-3 w-3" /> Key Attributes
              </span>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Add Custom Strength Input */}
            <div className="flex gap-2">
              <Input
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                placeholder="e.g. Strong problem-solving mindset"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAdd()
                  }
                }}
              />
              <Button onClick={handleAdd} variant="secondary" className="shrink-0 gap-1.5">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>

            {/* List of active draggable strengths */}
            {strengths.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'copy'
                }}
                onDrop={handleCardDrop}
                className={clsx(
                  'rounded-xl border-2 border-dashed p-8 text-center transition-all',
                  draggedPreset
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 animate-pulse'
                    : 'border-ink-200 text-ink-400'
                )}
              >
                <p className="text-sm font-medium">
                  {draggedPreset ? `Drop "${draggedPreset}" here to add` : 'No strengths added yet.'}
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  Pick or drag from the suggestions below, or type your own above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {strengths.map((item, idx) => {
                  const isDragging = draggedIdx === idx
                  const isOver = dragOverIdx === idx && (draggedIdx !== idx || !!draggedPreset)

                  return (
                    <div key={idx} className="relative">
                      {/* Dotted drop target indicator box above if dragging upwards or dragging preset */}
                      {isOver && ((draggedIdx !== null && draggedIdx > idx) || (draggedPreset && dragOverIdx === idx)) && (
                        <div
                          onDragOver={(e) => handleDragOver(idx, e)}
                          onDrop={(e) => handleDrop(idx, e)}
                          className="mb-2 strength-drop-zone animate-pulse"
                        >
                          <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                          <span>
                            {draggedPreset ? `Drop "${draggedPreset}" here as #${idx + 1}` : `Drop here as #${idx + 1}`}
                          </span>
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                        </div>
                      )}

                      <div
                        draggable={true}
                        onDragStart={(e) => handleDragStart(idx, e)}
                        onDragOver={(e) => handleDragOver(idx, e)}
                        onDrop={(e) => handleDrop(idx, e)}
                        onDragEnd={handleDragEnd}
                        className={clsx(
                          'strength-item-card',
                          isDragging && 'opacity-30 scale-[0.98] border-2 border-dashed border-amber-400',
                          isOver && 'border-2 border-dashed border-amber-500 ring-4 ring-amber-500/20 shadow-md'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className="flex items-center justify-center text-ink-400 group-hover:text-ink-600 transition-colors p-0.5 rounded hover:bg-ink-100 dark:hover:bg-ink-200"
                            title="Drag to reorder or drag below to remove"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <span className="strength-item-num">
                            {idx + 1}
                          </span>
                          <span className="strength-item-text">{item}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {strengths.length > 1 && (
                            <>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveUp(idx)}
                                className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-20 transition-colors"
                                title="Move up"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === strengths.length - 1}
                                onClick={() => handleMoveDown(idx)}
                                className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-20 transition-colors"
                                title="Move down"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            className="rounded p-1 text-ink-400 hover:bg-danger-100/60 hover:text-danger-600 transition-colors"
                            title="Remove strength"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Dotted drop target indicator box below if dragging downwards */}
                      {isOver && !draggedPreset && draggedIdx !== null && draggedIdx < idx && (
                        <div
                          onDragOver={(e) => handleDragOver(idx, e)}
                          onDrop={(e) => handleDrop(idx, e)}
                          className="mt-2 strength-drop-zone animate-pulse"
                        >
                          <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                          <span>Drop here as #{idx + 1}</span>
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quick Suggestions Card with Draggable & Droppable Zone */}
        <Card
          onDragOver={(e) => {
            if (draggedIdx !== null) {
              e.preventDefault()
              e.stopPropagation()
              e.dataTransfer.dropEffect = 'move'
              setIsSuggestionsDropTarget(true)
            }
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsSuggestionsDropTarget(false)
            }
          }}
          onDrop={handleSuggestionsDrop}
          className={clsx(
            'transition-all duration-200',
            isSuggestionsDropTarget && draggedIdx !== null && 'ring-4 ring-amber-500/30 border-amber-500 bg-amber-500/10 shadow-xl'
          )}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <h3 className="text-sm font-semibold text-ink-900">Quick Suggestions</h3>
              </div>
              {draggedIdx !== null && (
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold hidden sm:inline">
                  📥 Drop anywhere here to remove from strengths
                </span>
              )}
            </div>
          </CardHeader>
          <CardBody className="pb-5">
            {draggedIdx !== null && (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.dataTransfer.dropEffect = 'move'
                  setIsSuggestionsDropTarget(true)
                }}
                onDrop={handleSuggestionsDrop}
                className="mb-3 strength-drop-zone animate-pulse"
              >
                <Undo2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Drop here to remove "{strengths[draggedIdx]}" from strengths</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              {PRESET_STRENGTHS.map((preset) => {
                const isAdded = strengths.includes(preset)
                return (
                  <button
                    key={preset}
                    type="button"
                    draggable={!isAdded}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'copy'
                      e.dataTransfer.setData('text/plain', `preset:${preset}`)
                      setDraggedPreset(preset)
                    }}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleAddPreset(preset)}
                    disabled={isAdded}
                    className={isAdded ? 'strength-preset-btn-added' : 'strength-preset-btn'}
                    title={isAdded ? 'Already in your strengths (drag down to remove)' : 'Click to add or drag into your strengths'}
                  >
                    {isAdded ? (
                      <>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">✓</span>
                        <span>{preset}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-sm leading-none">+</span>
                        <span>{preset}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            onClick={handleSave}
            loading={updateMutation.isPending}
            className="gap-2 bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs font-semibold rounded-xl"
          >
            Save &amp; Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
