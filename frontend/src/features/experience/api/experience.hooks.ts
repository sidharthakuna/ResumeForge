import { createSubResourceHooks } from '@/lib/createSubResourceHooks'
import { experienceApi } from './experience.api'
import type { ExperienceRequest, ExperienceResponse } from '@/types/api'

export const {
  useAdd: useAddExperience,
  useUpdate: useUpdateExperience,
  useRemove: useRemoveExperience,
} = createSubResourceHooks<ExperienceRequest, ExperienceResponse>(experienceApi, 'Experience')
