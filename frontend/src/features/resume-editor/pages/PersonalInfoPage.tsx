import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import {
  personalInfoSchema,
  type PersonalInfoFormValues,
} from '@/features/resume-editor/schemas/personal-info.schema'
import { useAddPersonalInfo, useUpdatePersonalInfo } from '@/features/resume-editor/api/personal-info.hooks'
import { User, ArrowRight } from 'lucide-react'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { getTemplateById, templateSupportsPhoto } from '@/features/templates/renderers/registry'

function formatUrl(val?: string | null): string | null {
  if (!val || !val.trim()) return null
  const trimmed = val.trim()
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export default function PersonalInfoPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const addMutation = useAddPersonalInfo(resumeId)
  const updateMutation = useUpdatePersonalInfo(resumeId)
  const isSaving = addMutation.isPending || updateMutation.isPending

  const selectedTemplateId = useEditorUiStore((s) => s.getSelectedTemplate(resumeId))
  const template = getTemplateById(selectedTemplateId)
  const supportsPhoto = templateSupportsPhoto(template)
  const nextPath = supportsPhoto ? `/resumes/${resumeId}/edit/photo` : `/resumes/${resumeId}/edit/education`
  const nextLabel = supportsPhoto ? 'Photo' : 'Education'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: full.personalInfo?.fullName ?? '',
      jobTitle: full.personalInfo?.jobTitle ?? '',
      email: full.personalInfo?.email ?? '',
      phone: full.personalInfo?.phone ?? '',
      location: full.personalInfo?.location ?? '',
      linkedinUrl: full.personalInfo?.linkedinUrl ?? '',
      githubUrl: full.personalInfo?.githubUrl ?? '',
      portfolioUrl: full.personalInfo?.portfolioUrl ?? '',
      photoUrl: full.personalInfo?.photoUrl ?? '',
    },
  })

  // Keep the form in sync if personalInfo arrives/changes after mount
  useEffect(() => {
    reset({
      fullName: full.personalInfo?.fullName ?? '',
      jobTitle: full.personalInfo?.jobTitle ?? '',
      email: full.personalInfo?.email ?? '',
      phone: full.personalInfo?.phone ?? '',
      location: full.personalInfo?.location ?? '',
      linkedinUrl: full.personalInfo?.linkedinUrl ?? '',
      githubUrl: full.personalInfo?.githubUrl ?? '',
      portfolioUrl: full.personalInfo?.portfolioUrl ?? '',
      photoUrl: full.personalInfo?.photoUrl ?? '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full.personalInfo?.id, full.personalInfo?.photoUrl])

  async function onSubmit(values: PersonalInfoFormValues) {
    if (!isDirty && full.personalInfo) {
      navigate(nextPath)
      return
    }

    const body = {
      fullName: values.fullName.trim(),
      jobTitle: values.jobTitle?.trim() || null,
      email: values.email.trim(),
      phone: values.phone?.trim() || null,
      location: values.location?.trim() || null,
      linkedinUrl: formatUrl(values.linkedinUrl),
      githubUrl: formatUrl(values.githubUrl),
      portfolioUrl: formatUrl(values.portfolioUrl),
      photoUrl: full.personalInfo?.photoUrl || (values.photoUrl ? values.photoUrl.trim() : null),
    }
    
    try {
      if (full.personalInfo) {
        await updateMutation.mutateAsync({ id: full.personalInfo.id, body })
      } else {
        await addMutation.mutateAsync(body)
      }
      navigate(nextPath)
    } catch {
      // Error toast is handled by the hook
    }
  }

  function onInvalid(formErrors: typeof errors) {
    const errorList = Object.values(formErrors)
    if (errorList.length > 0 && errorList[0]?.message) {
      toast.error(errorList[0].message)
    } else {
      toast.error('Please check the required personal info fields')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-3.5 py-4 sm:px-6 sm:py-8">
      <SectionHeader
        title="Personal information"
        description="This appears at the top of every template — keep it accurate."
        icon={User}
        colorTone="amber"
      />

      <Card>
        <CardBody className="p-3.5 sm:p-6">
          <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full name *</Label>
                <Input id="fullName" placeholder="Sidhartha Kuna" invalid={!!errors.fullName} {...register('fullName')} />
                <FieldError message={errors.fullName?.message} />
              </div>
              <div>
                <Label htmlFor="jobTitle">Job Title / Tagline</Label>
                <Input id="jobTitle" placeholder="Full Stack Java Developer" invalid={!!errors.jobTitle} {...register('jobTitle')} />
                <FieldError message={errors.jobTitle?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="sidharthakuna@gmail.com" invalid={!!errors.email} {...register('email')} />
                <FieldError message={errors.email?.message} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+91 98765 43210" invalid={!!errors.phone} {...register('phone')} />
                <FieldError message={errors.phone?.message} />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Bengaluru, Karnataka, India" invalid={!!errors.location} {...register('location')} />
              <FieldError message={errors.location?.message} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  placeholder="https://github.com/sidharthakuna"
                  invalid={!!errors.githubUrl}
                  {...register('githubUrl')}
                />
                <FieldError message={errors.githubUrl?.message} />
              </div>
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/sidharthakuna"
                  invalid={!!errors.linkedinUrl}
                  {...register('linkedinUrl')}
                />
                <FieldError message={errors.linkedinUrl?.message} />
              </div>
              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input
                  id="portfolioUrl"
                  placeholder="https://sidharthakuna.dev"
                  invalid={!!errors.portfolioUrl}
                  {...register('portfolioUrl')}
                />
                <FieldError message={errors.portfolioUrl?.message} />
              </div>
            </div>



            <div className="flex items-center justify-between gap-2.5 pt-3.5 border-t border-ink-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(nextPath)}
                className="gap-1 text-xs text-ink-600 hover:text-ink-900 h-9 px-3"
              >
                Skip to {nextLabel} <ArrowRight className="h-3 w-3" />
              </Button>
              <Button
                type="submit"
                loading={isSaving}
                className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs font-semibold rounded-xl text-xs sm:text-sm h-9 px-4"
              >
                Save &amp; Continue
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

