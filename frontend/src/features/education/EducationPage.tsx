import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { educationSchema, type EducationFormValues } from './schemas/education.schema'
import { useAddEducation, useUpdateEducation, useRemoveEducation } from './api/education.hooks'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { SectionListEditor } from '@/components/feedback/SectionListEditor'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'
import type { EducationResponse } from '@/types/api'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'

function fmtRange(start: string | null, end: string | null) {
  if (!start && !end) return ''
  const s = start ? format(parseISO(start), 'yyyy') : ''
  const e = end ? format(parseISO(end), 'yyyy') : (start ? 'Present' : '')
  if (s && e) return `${s} – ${e}`
  return s || e
}

export default function EducationPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addMutation = useAddEducation(resumeId)
  const updateMutation = useUpdateEducation(resumeId)
  const removeMutation = useRemoveEducation(resumeId)

  const nextPath = `/resumes/${resumeId}/edit/experience`

  function handleReorder(newEducation: EducationResponse[]) {
    queryClient.setQueryData(queryKeys.resume.full(resumeId), (old: any) => {
      if (!old) return old
      return { ...old, education: newEducation }
    })
    toast.success('Education reordered')
  }

  return (
    <div className="mx-auto max-w-3xl px-3.5 py-4 sm:px-6 sm:py-8">
      <SectionHeader
        title="Education"
        description="Add your degrees and academic qualifications — most recent first."
        icon={GraduationCap}
        colorTone="emerald"
      />
      <SectionListEditor<EducationResponse>
        items={full.education}
        onReorder={handleReorder}
        emptyIcon={GraduationCap}
        emptyTitle="No education added yet"
        emptyDescription="Add your degrees, institution, and CGPA/Percentage — most recent first."
        addLabel="Add education"
        deleting={removeMutation.isPending}
        onDelete={(id) => removeMutation.mutate(id)}
        itemLabelForDelete={(item) => `${item.degree} — ${item.institution}`}
        renderItem={(item) => (
          <div className="min-w-0">
            <p className="font-semibold text-xs sm:text-sm text-ink-900 truncate">{item.degree}</p>
            <p className="text-[11px] sm:text-xs text-ink-600 truncate">
              {item.institution}
              {item.fieldOfStudy && ` · ${item.fieldOfStudy}`}
              {item.grade && ` · ${item.grade}`}
            </p>
            <p className="mt-0.5 font-mono text-[10px] sm:text-xs text-ink-400">{fmtRange(item.startDate, item.endDate)}</p>
          </div>
        )}
        renderForm={({ editing, onDone }) => (
          <EducationForm
            resumeId={resumeId}
            editing={editing}
            onDone={onDone}
            addMutation={addMutation}
            updateMutation={updateMutation}
          />
        )}
      />

      <div className="mt-5 sm:mt-6 flex justify-end">
        <Button onClick={() => navigate(nextPath)} variant="secondary" className="gap-1.5 text-xs sm:text-sm h-9">
          Next: Experience <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function EducationForm({
  editing,
  onDone,
  addMutation,
  updateMutation,
}: {
  resumeId: string
  editing: EducationResponse | null
  onDone: () => void
  addMutation: ReturnType<typeof useAddEducation>
  updateMutation: ReturnType<typeof useUpdateEducation>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: editing
      ? {
          institution: editing.institution,
          degree: editing.degree,
          fieldOfStudy: editing.fieldOfStudy ?? '',
          grade: editing.grade ?? '',
          startDate: editing.startDate ?? '',
          endDate: editing.endDate ?? '',
        }
      : { institution: '', degree: '', fieldOfStudy: '', grade: '', startDate: '', endDate: '' },
  })

  function onSubmit(values: EducationFormValues) {
    const body = {
      institution: values.institution,
      degree: values.degree,
      fieldOfStudy: values.fieldOfStudy || null,
      grade: values.grade || null,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
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
    <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="degree">Degree *</Label>
          <Input id="degree" placeholder="B.S. in Computer Science" invalid={!!errors.degree} {...register('degree')} />
          <FieldError message={errors.degree?.message} />
        </div>
        <div>
          <Label htmlFor="institution">Institution *</Label>
          <Input id="institution" placeholder="University of California, Berkeley" invalid={!!errors.institution} {...register('institution')} />
          <FieldError message={errors.institution?.message} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="fieldOfStudy">Field of study (optional)</Label>
          <Input id="fieldOfStudy" placeholder="Computer Science & Engineering" {...register('fieldOfStudy')} />
        </div>
        <div>
          <Label htmlFor="grade">Grade / CGPA / Percentage (optional)</Label>
          <Input id="grade" placeholder="GPA: 3.8 / 4.0" {...register('grade')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="startDate">Start date (optional)</Label>
          <Input id="startDate" type="date" invalid={!!errors.startDate} {...register('startDate')} />
          <FieldError message={errors.startDate?.message} />
        </div>
        <div>
          <Label htmlFor="endDate">End date (optional / blank if ongoing)</Label>
          <Input id="endDate" type="date" {...register('endDate')} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone} className="text-xs h-9">
          Cancel
        </Button>
        <Button type="submit" loading={isSaving} className="bg-indigo-600 text-white hover:bg-indigo-500 text-xs sm:text-sm h-9">
          {editing ? 'Save changes' : 'Add education'}
        </Button>
      </div>
    </form>
  )
}

