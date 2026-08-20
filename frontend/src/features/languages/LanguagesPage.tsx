import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Languages as LanguagesIcon, ArrowRight } from 'lucide-react'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import {
  languageSchema,
  proficiencyLevels,
  proficiencyLabels,
  type LanguageFormValues,
} from './schemas/language.schema'
import { useAddLanguage, useUpdateLanguage, useRemoveLanguage } from './api/language.hooks'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { SectionListEditor } from '@/components/feedback/SectionListEditor'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import type { LanguageResponse } from '@/types/api'

export default function LanguagesPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addMutation = useAddLanguage(resumeId)
  const updateMutation = useUpdateLanguage(resumeId)
  const removeMutation = useRemoveLanguage(resumeId)

  const nextPath = `/resumes/${resumeId}/edit/summary`

  function handleReorder(newLanguages: LanguageResponse[]) {
    queryClient.setQueryData(queryKeys.resume.full(resumeId), (old: any) => {
      if (!old) return old
      return { ...old, languages: newLanguages }
    })
    toast.success('Languages reordered')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="Languages"
        description="Languages you speak and your proficiency in each."
        icon={LanguagesIcon}
        colorTone="teal"
      />
      <SectionListEditor<LanguageResponse>
        items={full.languages}
        onReorder={handleReorder}
        emptyIcon={LanguagesIcon}
        emptyTitle="No languages added yet"
        emptyDescription="Add languages you speak, with your proficiency level."
        addLabel="Add language"
        deleting={removeMutation.isPending}
        onDelete={(id) => removeMutation.mutate(id)}
        itemLabelForDelete={(item) => item.languageName}
        renderItem={(item) => (
          <div className="flex items-center gap-2.5">
            <p className="font-medium text-ink-900">{item.languageName}</p>
            <Badge tone="neutral">{proficiencyLabels[item.proficiencyLevel]}</Badge>
          </div>
        )}
        renderForm={({ editing, onDone }) => (
          <LanguageForm
            editing={editing}
            onDone={onDone}
            addMutation={addMutation}
            updateMutation={updateMutation}
          />
        )}
      />

      <div className="mt-6 flex justify-end">
        <Button onClick={() => navigate(nextPath)} variant="secondary" className="gap-2">
          Next: Summary <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function LanguageForm({
  editing,
  onDone,
  addMutation,
  updateMutation,
}: {
  editing: LanguageResponse | null
  onDone: () => void
  addMutation: ReturnType<typeof useAddLanguage>
  updateMutation: ReturnType<typeof useUpdateLanguage>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: editing
      ? { languageName: editing.languageName, proficiencyLevel: editing.proficiencyLevel }
      : { languageName: '', proficiencyLevel: 'PROFESSIONAL' },
  })

  function onSubmit(values: LanguageFormValues) {
    const handleSuccess = () => {
      onDone()
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, body: values }, { onSuccess: handleSuccess })
    } else {
      addMutation.mutate(values, { onSuccess: handleSuccess })
    }
  }

  const isSaving = addMutation.isPending || updateMutation.isPending

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <Label htmlFor="languageName">Language</Label>
        <Input id="languageName" invalid={!!errors.languageName} {...register('languageName')} />
        <FieldError message={errors.languageName?.message} />
      </div>
      <div>
        <Label htmlFor="proficiencyLevel">Proficiency</Label>
        <Select id="proficiencyLevel" {...register('proficiencyLevel')}>
          {proficiencyLevels.map((level) => (
            <option key={level} value={level}>
              {proficiencyLabels[level]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isSaving}>
          {editing ? 'Save changes' : 'Add language'}
        </Button>
      </div>
    </form>
  )
}
