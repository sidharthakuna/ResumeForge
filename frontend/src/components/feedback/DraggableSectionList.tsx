import { useState, type ReactNode } from 'react'
import { Pencil, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

export interface DraggableItemProps<T extends { id: string }> {
  items: T[]
  onReorder?: (newItems: T[]) => void
  renderItem: (item: T, index: number) => ReactNode
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

/**
 * Dedicated reusable drag-and-drop & reorderable list component.
 * Encapsulates HTML5 drag-and-drop, position numbering, visual drop zone indicators,
 * and keyboard/touch accessible up/down ordering buttons.
 */
export function DraggableSectionList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  onEdit,
  onDelete,
}: DraggableItemProps<T>) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  function handleMoveUp(index: number) {
    if (index <= 0 || !onReorder) return
    const reordered = [...items]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(index - 1, 0, moved)
    onReorder(reordered)
  }

  function handleMoveDown(index: number) {
    if (index >= items.length - 1 || !onReorder) return
    const reordered = [...items]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(index + 1, 0, moved)
    onReorder(reordered)
  }

  function handleDragStart(index: number, e: React.DragEvent) {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', `${index}`)
  }

  function handleDragOver(index: number, e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIdx !== index) {
      setDragOverIdx(index)
    }
  }

  function handleDrop(index: number, e: React.DragEvent) {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === index || !onReorder) {
      setDraggedIdx(null)
      setDragOverIdx(null)
      return
    }
    const reordered = [...items]
    const [moved] = reordered.splice(draggedIdx, 1)
    reordered.splice(index, 0, moved)
    onReorder(reordered)
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  function handleDragEnd() {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isDragging = draggedIdx === idx
        const isOver = dragOverIdx === idx && draggedIdx !== idx

        return (
          <div key={item.id} className="relative">
            {/* Dotted drop target indicator box above when dragging upwards */}
            {isOver && draggedIdx !== null && draggedIdx > idx && (
              <div
                onDragOver={(e) => handleDragOver(idx, e)}
                onDrop={(e) => handleDrop(idx, e)}
                className="mb-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brass-500 bg-brass-500/15 py-3 px-4 text-xs font-semibold text-brass-600 dark:text-brass-400 shadow-inner animate-pulse transition-all"
              >
                <div className="h-2 w-2 rounded-full bg-brass-500 animate-ping" />
                <span>Drop here to place as #{idx + 1}</span>
                <div className="h-2 w-2 rounded-full bg-brass-500" />
              </div>
            )}

            <Card
              draggable={!!onReorder && items.length > 1}
              onDragStart={(e) => handleDragStart(idx, e)}
              onDragOver={(e) => handleDragOver(idx, e)}
              onDrop={(e) => handleDrop(idx, e)}
              onDragEnd={handleDragEnd}
              className={clsx(
                'group transition-all duration-200 select-none relative',
                isDragging && 'opacity-30 scale-[0.98] border-2 border-dashed border-indigo-500 bg-indigo-500/5',
                isOver && 'border-2 border-dashed border-indigo-500 ring-4 ring-indigo-500/20 bg-indigo-500/10 shadow-lg',
                onReorder && items.length > 1 && 'hover:border-ink-300'
              )}
            >
              <div className="flex items-start justify-between gap-2.5 p-3 sm:p-4">
                {/* Drag Handle & Position Badge */}
                {onReorder && (
                  <div className="flex shrink-0 items-center gap-1.5 self-center -ml-0.5 pr-0.5">
                    <div
                      className={clsx(
                        'flex items-center justify-center text-ink-300 group-hover:text-ink-600 transition-colors p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-200',
                        items.length > 1 ? 'cursor-grab active:cursor-grabbing' : 'opacity-40 cursor-default'
                      )}
                      title={items.length > 1 ? 'Drag to reorder' : `Position ${idx + 1}`}
                    >
                      <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-200 text-[10px] font-mono font-bold text-ink-500">
                      {idx + 1}
                    </span>
                  </div>
                )}

                {/* Custom Content Slot */}
                <div className="min-w-0 flex-1 overflow-hidden break-words">{renderItem(item, idx)}</div>

                {/* Actions: Reorder arrows, Edit, Delete */}
                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 opacity-100 transition-opacity">
                  {onReorder && items.length > 1 && (
                    <div className="hidden sm:flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        aria-label="Move up"
                        title="Move up"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-ink-500 hover:text-ink-900 disabled:opacity-20"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === items.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        aria-label="Move down"
                        title="Move down"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-ink-500 hover:text-ink-900 disabled:opacity-20"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      aria-label="Edit"
                      className="h-8 w-8 text-ink-600 hover:text-ink-950 hover:bg-ink-100 dark:hover:bg-ink-200"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                      aria-label="Delete"
                      className="h-8 w-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Dotted drop target indicator box below when dragging downwards */}
            {isOver && draggedIdx !== null && draggedIdx < idx && (
              <div
                onDragOver={(e) => handleDragOver(idx, e)}
                onDrop={(e) => handleDrop(idx, e)}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brass-500 bg-brass-500/15 py-3 px-4 text-xs font-semibold text-brass-600 dark:text-brass-400 shadow-inner animate-pulse transition-all"
              >
                <div className="h-2 w-2 rounded-full bg-brass-500 animate-ping" />
                <span>Drop here to place as #{idx + 1}</span>
                <div className="h-2 w-2 rounded-full bg-brass-500" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
