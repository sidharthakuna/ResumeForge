import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trophy, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { achievementSchema, type AchievementFormValues } from './schemas/achievement.schema'
import { useAddAchievement, useUpdateAchievement, useRemoveAchievement } from './api/achievement.hooks'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { SectionListEditor } from '@/components/feedback/SectionListEditor'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import type { AchievementResponse } from '@/types/api'

export default function AchievementsPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addMutation = useAddAchievement(resumeId)
  const updateMutation = useUpdateAchievement(resumeId)
  const removeMutation = useRemoveAchievement(resumeId)

  const nextPath = `/resumes/${resumeId}/edit/strengths`

  function handleReorder(newAchievements: AchievementResponse[]) {
    queryClient.setQueryData(queryKeys.resume.full(resumeId), (old: any) => {
      if (!old) return old
      return { ...old, achievements: newAchievements }
    })
    toast.success('Achievements reordered')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="Achievements"
        description="Awards, honors, and notable recognitions."
        icon={Trophy}
        colorTone="blue"
      />
      <SectionListEditor<AchievementResponse>
        items={full.achievements}
        onReorder={handleReorder}
        emptyIcon={Trophy}
        emptyTitle="No achievements added yet"
        emptyDescription="Add awards or recognitions that back up your experience."
        addLabel="Add achievement"
        deleting={removeMutation.isPending}
        onDelete={(id) => removeMutation.mutate(id)}
        itemLabelForDelete={(item) => item.title}
        renderItem={(item) => (
          <div>
            <p className="font-medium text-ink-900">{item.title}</p>
            {item.issuer && <p className="text-sm text-ink-600">{item.issuer}</p>}
            {item.achievementDate && (
              <p className="mt-0.5 font-mono text-xs text-ink-400">
                {format(parseISO(item.achievementDate), 'MMM yyyy')}
              </p>
            )}
            {item.description && <p className="mt-2 text-sm text-ink-600">{item.description}</p>}
          </div>
        )}
        renderForm={({ editing, onDone }) => (
          <AchievementForm
            editing={editing}
            onDone={onDone}
            addMutation={addMutation}
            updateMutation={updateMutation}
          />
        )}
      />

      <div className="mt-6 flex justify-end">
        <Button onClick={() => navigate(nextPath)} variant="secondary" className="gap-2">
          Next: Languages <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function AchievementForm({
  editing,
  onDone,
  addMutation,
  updateMutation,
}: {
  editing: AchievementResponse | null
  onDone: () => void
  addMutation: ReturnType<typeof useAddAchievement>
  updateMutation: ReturnType<typeof useUpdateAchievement>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: editing
      ? {
          title: editing.title,
          description: editing.description ?? '',
          issuer: editing.issuer ?? '',
          achievementDate: editing.achievementDate ?? '',
        }
      : { title: '', description: '', issuer: '', achievementDate: '' },
  })

  function onSubmit(values: AchievementFormValues) {
    const body = {
      title: values.title,
      description: values.description || null,
      issuer: values.issuer || null,
      achievementDate: values.achievementDate || null,
    }
    const handleSuccess = () => {
      onDone()
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, body }, { onSuccess: handleSuccess })
    } else {
      addMutation.mutate(body, { onSuccess: handleSuccess })
    }
  }

  const isSaving = addMutation.isPending || updateMutation.isPending

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" invalid={!!errors.title} {...register('title')} />
        <FieldError message={errors.title?.message} />
      </div>
      <div>
        <Label htmlFor="issuer">Issuer (optional)</Label>
        <Input id="issuer" {...register('issuer')} />
      </div>
      <div>
        <Label htmlFor="achievementDate">Date (optional)</Label>
        <Input id="achievementDate" type="date" invalid={!!errors.achievementDate} {...register('achievementDate')} />
        <FieldError message={errors.achievementDate?.message} />
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" rows={3} {...register('description')} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isSaving}>
          {editing ? 'Save changes' : 'Add achievement'}
        </Button>
      </div>
    </form>
  )
}
