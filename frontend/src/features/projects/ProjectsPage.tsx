import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FolderGit2, GitBranch, ExternalLink, ArrowRight, Sparkles } from 'lucide-react'
import { useEditorContext } from '@/app/layouts/EditorLayout'
import { projectSchema, type ProjectFormValues } from './schemas/project.schema'
import { useAddProject, useUpdateProject, useRemoveProject } from './api/project.hooks'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { SectionListEditor } from '@/components/feedback/SectionListEditor'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FieldError } from '@/components/ui/FieldError'
import { Button } from '@/components/ui/Button'
import { ProjectAiModal } from '@/features/ai-assistant/components/ProjectAiModal'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import type { ProjectResponse } from '@/types/api'

export default function ProjectsPage() {
  const { full, resumeId } = useEditorContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addMutation = useAddProject(resumeId)
  const updateMutation = useUpdateProject(resumeId)
  const removeMutation = useRemoveProject(resumeId)

  const nextPath = `/resumes/${resumeId}/edit/skills`

  function handleReorder(newProjects: ProjectResponse[]) {
    queryClient.setQueryData(queryKeys.resume.full(resumeId), (old: any) => {
      if (!old) return old
      return { ...old, projects: newProjects }
    })
    toast.success('Projects reordered')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <SectionHeader
        title="Projects"
        description="Personal, academic, or open-source projects worth showing."
        icon={FolderGit2}
        colorTone="cyan"
      />
      <SectionListEditor<ProjectResponse>
        items={full.projects}
        onReorder={handleReorder}
        emptyIcon={FolderGit2}
        emptyTitle="No projects added yet"
        emptyDescription="Add a project with a link to code or a live demo."
        addLabel="Add project"
        deleting={removeMutation.isPending}
        onDelete={(id) => removeMutation.mutate(id)}
        itemLabelForDelete={(item) => item.title}
        renderItem={(item) => (
          <div>
            <p className="font-medium text-ink-900">{item.title}</p>
            {item.description && <p className="mt-1 text-sm text-ink-600 whitespace-pre-line">{item.description}</p>}
            <div className="mt-2 flex gap-3">
              {item.githubUrl && (
                <a
                  href={item.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GitBranch className="h-3 w-3" /> Code
                </a>
              )}
              {item.demoUrl && (
                <a
                  href={item.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" /> Demo
                </a>
              )}
            </div>
          </div>
        )}
        renderForm={({ editing, onDone }) => (
          <ProjectForm
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
          Next: Skills <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ProjectForm({
  resumeId,
  editing,
  onDone,
  addMutation,
  updateMutation,
}: {
  resumeId: string
  editing: ProjectResponse | null
  onDone: () => void
  addMutation: ReturnType<typeof useAddProject>
  updateMutation: ReturnType<typeof useUpdateProject>
}) {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: editing
      ? {
          title: editing.title,
          description: editing.description ?? '',
          githubUrl: editing.githubUrl ?? '',
          demoUrl: editing.demoUrl ?? '',
          startDate: editing.startDate ?? '',
          endDate: editing.endDate ?? '',
          currentlyBuilding: editing.currentlyBuilding,
        }
      : {
          title: '',
          description: '',
          githubUrl: '',
          demoUrl: '',
          startDate: '',
          endDate: '',
          currentlyBuilding: false,
        },
  })
  const currentlyBuilding = watch('currentlyBuilding')
  const titleValue = watch('title')
  const descriptionValue = watch('description')

  function onSubmit(values: ProjectFormValues) {
    const body = {
      title: values.title,
      description: values.description || null,
      githubUrl: values.githubUrl || null,
      demoUrl: values.demoUrl || null,
      startDate: values.startDate || null,
      endDate: values.currentlyBuilding ? null : values.endDate || null,
      currentlyBuilding: values.currentlyBuilding,
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
          <Label htmlFor="title">Title</Label>
          <Input id="title" invalid={!!errors.title} {...register('title')} />
          <FieldError message={errors.title?.message} />
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
              Write with AI / README
            </Button>
          </div>
          <Textarea id="description" rows={4} {...register('description')} placeholder="• Developed scalable backend APIs with Java and PostgreSQL..." />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
            <Input id="githubUrl" placeholder="https://github.com/…" invalid={!!errors.githubUrl} {...register('githubUrl')} />
            <FieldError message={errors.githubUrl?.message} />
          </div>
          <div>
            <Label htmlFor="demoUrl">Demo URL (optional)</Label>
            <Input id="demoUrl" placeholder="https://…" invalid={!!errors.demoUrl} {...register('demoUrl')} />
            <FieldError message={errors.demoUrl?.message} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" className="h-4 w-4 rounded border-ink-300" {...register('currentlyBuilding')} />
          Still building this
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start date (optional)</Label>
            <Input id="startDate" type="date" {...register('startDate')} />
          </div>
          <div>
            <Label htmlFor="endDate">End date (optional)</Label>
            <Input id="endDate" type="date" disabled={currentlyBuilding} {...register('endDate')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            {editing ? 'Save changes' : 'Add project'}
          </Button>
        </div>
      </form>

      <ProjectAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        resumeId={resumeId}
        title={titleValue || 'Project'}
        initialDescription={descriptionValue || ''}
        onApply={(refined) => {
          setValue('description', refined, { shouldDirty: true })
          toast.success('AI project description inserted!')
        }}
      />
    </>
  )
}
