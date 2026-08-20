import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DraggableSectionList } from './DraggableSectionList'
import type { LucideIcon } from 'lucide-react'

interface SectionListEditorProps<T extends { id: string }> {
  items: T[]
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription: string
  addLabel: string
  renderItem: (item: T) => ReactNode
  renderForm: (opts: { editing: T | null; onDone: () => void }) => ReactNode
  onDelete: (id: string) => void
  deleting: boolean
  itemLabelForDelete: (item: T) => string
  onReorder?: (newItems: T[]) => void
}

/**
 * Shared list/form toggle used by every sub-resource section (education,
 * experience, projects, skills, certifications, achievements, languages).
 * Uses the standalone DraggableSectionList component for drag-and-drop & ordering.
 */
export function SectionListEditor<T extends { id: string }>({
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  addLabel,
  renderItem,
  renderForm,
  onDelete,
  deleting,
  itemLabelForDelete,
  onReorder,
}: SectionListEditorProps<T>) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [pendingDelete, setPendingDelete] = useState<T | null>(null)

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(item: T) {
    setEditing(item)
    setFormOpen(true)
  }
  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  if (formOpen) {
    return (
      <Card>
        <div className="p-5">{renderForm({ editing, onDone: closeForm })}</div>
      </Card>
    )
  }

  return (
    <div>
      {items.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> {addLabel}
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={openAdd} size="sm">
              <Plus className="h-4 w-4" /> {addLabel}
            </Button>
          </div>

          <DraggableSectionList<T>
            items={items}
            onReorder={onReorder}
            renderItem={renderItem}
            onEdit={openEdit}
            onDelete={(item) => setPendingDelete(item)}
          />
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this entry?"
        description={pendingDelete ? `"${itemLabelForDelete(pendingDelete)}" will be permanently removed.` : ''}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id)
          setPendingDelete(null)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
