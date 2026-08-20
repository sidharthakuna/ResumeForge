import { createSubResourceHooks } from '@/lib/createSubResourceHooks'
import { projectApi } from './project.api'
import type { ProjectRequest, ProjectResponse } from '@/types/api'

export const {
  useAdd: useAddProject,
  useUpdate: useUpdateProject,
  useRemove: useRemoveProject,
} = createSubResourceHooks<ProjectRequest, ProjectResponse>(projectApi, 'Project')
