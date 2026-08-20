import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Briefcase, ArrowRight, Sparkles } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { experienceSchema, type ExperienceFormValues } from './schemas/experience.schema'
import { useAddExperience, useUpdateExperience, useRemoveExperience } from './api/experience.hooks'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { SectionListEditor } from '@/components/feedback/SectionListEditor'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'
import { ExperienceAiModal } from '@/features/ai-assistant/components/ExperienceAiModal'
import type { ExperienceResponse } from '@/types/api'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'

function fmtRange(start: string | null, end: string | null, current: boolean) {
  if (!start && !end && !current) return ''
  const s = start ? format(parseISO(start), 'MMM yyyy') : ''
  const e = current ? 'Present' : (end ? format(parseISO(end), 'MMM yyyy') : '')
  if (s && e) return `${s} – ${e}`
  return s || e || (current ? 'Present' : '')
}

export default function ExperiencePage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addMutation = useAddExperience(resumeId)
  const updateMutation = useUpdateExperience(resumeId)
  const removeMutation = useRemoveExperience(resumeId)

  const nextPath = `/resumes/${resumeId}/edit/projects`

  function handleReorder(newExperience: ExperienceResponse[]) {
    queryClient.setQueryData(queryKeys.resume.full(resumeId), (old: any) => {
      if (!old) return old
      return { ...old, experience: newExperience }
    })
    toast.success('Experience reordered')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="Experience"
        description="Your work history, most recent first."
        icon={Briefcase}
        colorTone="purple"
      />
      <SectionListEditor<ExperienceResponse>
        items={full.experience}
        onReorder={handleReorder}
        emptyIcon={Briefcase}
        emptyTitle="No experience added yet"
        emptyDescription="Add roles you've held — most recent first."
        addLabel="Add experience"
        deleting={removeMutation.isPending}
        onDelete={(id) => removeMutation.mutate(id)}
        itemLabelForDelete={(item) => `${item.jobTitle} at ${item.company}`}
        renderItem={(item) => (
          <div>
            <p className="font-medium text-ink-900">{item.jobTitle}</p>
            <p className="text-sm text-ink-600">{item.company}</p>
            <p className="mt-0.5 font-mono text-xs text-ink-400">
              {fmtRange(item.startDate, item.endDate, item.currentlyWorking)}
            </p>
            {item.description && <p className="mt-2 text-sm text-ink-600 whitespace-pre-line">{item.description}</p>}
          </div>
        )}
        renderForm={({ editing, onDone }) => (
          <ExperienceForm
            resumeId={resumeId}
            editing={editing}
            onDone={onDone}
            addMutation={addMutation}
            updateMutation={updateMutation}
          />
        )}
      />

      <div className="mt-6 flex justify-end">
        <Button onClick={() => navigate(nextPath)} variant="secondary" className="gap-2">
          Next: Projects <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ExperienceForm({
  resumeId,
  editing,
  onDone,
  addMutation,
  updateMutation,
}: {
  resumeId: string
  editing: ExperienceResponse | null
  onDone: () => void
  addMutation: ReturnType<typeof useAddExperience>
  updateMutation: ReturnType<typeof useUpdateExperience>
}) {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: editing
      ? {
          jobTitle: editing.jobTitle,
          company: editing.company,
          description: editing.description ?? '',
          startDate: editing.startDate ?? '',
          endDate: editing.endDate ?? '',
          currentlyWorking: editing.currentlyWorking,
        }
      : { jobTitle: '', company: '', description: '', startDate: '', endDate: '', currentlyWorking: false },
  })
  const currentlyWorking = watch('currentlyWorking')
  const jobTitleValue = watch('jobTitle')
  const companyValue = watch('company')
  const descriptionValue = watch('description')

  function onSubmit(values: ExperienceFormValues) {
    const body = {
      jobTitle: values.jobTitle,
      company: values.company,
      description: values.description || null,
      startDate: values.startDate || null,
      endDate: values.currentlyWorking ? null : values.endDate || null,
      currentlyWorking: values.currentlyWorking,
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
    <>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <Label htmlFor="jobTitle">Job title</Label>
          <Input id="jobTitle" invalid={!!errors.jobTitle} {...register('jobTitle')} placeholder="e.g. Backend Developer" />
          <FieldError message={errors.jobTitle?.message} />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" invalid={!!errors.company} {...register('company')} placeholder="e.g. Acme Tech" />
          <FieldError message={errors.company?.message} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="description">Description (optional)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
              className="gap-1.5 text-xs text-purple-600 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/50"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              Improve with AI
            </Button>
          </div>
          <Textarea id="description" rows={4} {...register('description')} placeholder="• Developed scalable REST APIs using Java and Spring Boot..." />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" className="h-4 w-4 rounded border-ink-300" {...register('currentlyWorking')} />
          I currently work here
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start date (optional)</Label>
            <Input id="startDate" type="date" invalid={!!errors.startDate} {...register('startDate')} />
            <FieldError message={errors.startDate?.message} />
          </div>
          <div>
            <Label htmlFor="endDate">End date (optional)</Label>
            <Input id="endDate" type="date" disabled={currentlyWorking} {...register('endDate')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            {editing ? 'Save changes' : 'Add experience'}
          </Button>
        </div>
      </form>

      <ExperienceAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        resumeId={resumeId}
        jobTitle={jobTitleValue || 'Role'}
        company={companyValue || 'Company'}
        initialDescription={descriptionValue || ''}
        onApply={(refined) => {
          setValue('description', refined, { shouldDirty: true })
          toast.success('AI experience bullets inserted!')
        }}
      />
    </>
  )
}
