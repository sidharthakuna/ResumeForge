import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Award, ExternalLink, ArrowRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { certificationSchema, type CertificationFormValues } from './schemas/certification.schema'
import { useAddCertification, useUpdateCertification, useRemoveCertification } from './api/certification.hooks'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { SectionListEditor } from '@/components/feedback/SectionListEditor'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import type { CertificationResponse } from '@/types/api'

export default function CertificationsPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addMutation = useAddCertification(resumeId)
  const updateMutation = useUpdateCertification(resumeId)
  const removeMutation = useRemoveCertification(resumeId)

  const nextPath = `/resumes/${resumeId}/edit/achievements`

  function handleReorder(newCertifications: CertificationResponse[]) {
    queryClient.setQueryData(queryKeys.resume.full(resumeId), (old: any) => {
      if (!old) return old
      return { ...old, certifications: newCertifications }
    })
    toast.success('Certifications reordered')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="Certifications"
        description="Professional certifications and credentials."
        icon={Award}
        colorTone="amber"
      />
      <SectionListEditor<CertificationResponse>
        items={full.certifications}
        onReorder={handleReorder}
        emptyIcon={Award}
        emptyTitle="No certifications added yet"
        emptyDescription="Add certifications relevant to the roles you're targeting."
        addLabel="Add certification"
        deleting={removeMutation.isPending}
        onDelete={(id) => removeMutation.mutate(id)}
        itemLabelForDelete={(item) => item.name}
        renderItem={(item) => (
          <div>
            <p className="font-medium text-ink-900">{item.name}</p>
            <p className="text-sm text-ink-600">{item.issuingOrganization}</p>
            {(item.issueDate || item.expirationDate) && (
              <p className="mt-0.5 font-mono text-xs text-ink-400">
                {item.issueDate && `Issued ${format(parseISO(item.issueDate), 'MMM yyyy')}`}
                {item.expirationDate && ` · Expires ${format(parseISO(item.expirationDate), 'MMM yyyy')}`}
              </p>
            )}
            {item.credentialUrl && (
              <a
                href={item.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 flex w-fit items-center gap-1 text-xs text-ink-500 hover:text-ink-800"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" /> Verify credential
              </a>
            )}
          </div>
        )}
        renderForm={({ editing, onDone }) => (
          <CertificationForm
            editing={editing}
            onDone={onDone}
            addMutation={addMutation}
            updateMutation={updateMutation}
          />
        )}
      />

      <div className="mt-6 flex justify-end">
        <Button onClick={() => navigate(nextPath)} variant="secondary" className="gap-2">
          Next: Achievements <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function CertificationForm({
  editing,
  onDone,
  addMutation,
  updateMutation,
}: {
  editing: CertificationResponse | null
  onDone: () => void
  addMutation: ReturnType<typeof useAddCertification>
  updateMutation: ReturnType<typeof useUpdateCertification>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: editing
      ? {
        name: editing.name,
        issuingOrganization: editing.issuingOrganization,
        issueDate: editing.issueDate ?? '',
        expirationDate: editing.expirationDate ?? '',
        credentialId: editing.credentialId ?? '',
        credentialUrl: editing.credentialUrl ?? '',
      }
      : {
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
      },
  })

  function onSubmit(values: CertificationFormValues) {
    const body = {
      name: values.name,
      issuingOrganization: values.issuingOrganization,
      issueDate: values.issueDate || null,
      expirationDate: values.expirationDate || null,
      credentialId: values.credentialId || null,
      credentialUrl: values.credentialUrl || null,
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
        <Label htmlFor="name">Certification name</Label>
        <Input id="name" invalid={!!errors.name} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>
      <div>
        <Label htmlFor="issuingOrganization">Issuing organization</Label>
        <Input id="issuingOrganization" invalid={!!errors.issuingOrganization} {...register('issuingOrganization')} />
        <FieldError message={errors.issuingOrganization?.message} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="issueDate">Issue date (optional)</Label>
          <Input id="issueDate" type="date" invalid={!!errors.issueDate} {...register('issueDate')} />
          <FieldError message={errors.issueDate?.message} />
        </div>
        <div>
          <Label htmlFor="expirationDate">Expiration date (optional)</Label>
          <Input id="expirationDate" type="date" {...register('expirationDate')} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="credentialId">Credential ID (optional)</Label>
          <Input id="credentialId" {...register('credentialId')} />
        </div>
        <div>
          <Label htmlFor="credentialUrl">Verification URL (optional)</Label>
          <Input id="credentialUrl" placeholder="https://…" invalid={!!errors.credentialUrl} {...register('credentialUrl')} />
          <FieldError message={errors.credentialUrl?.message} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={isSaving}>
          {editing ? 'Save changes' : 'Add certification'}
        </Button>
      </div>
    </form>
  )
}
