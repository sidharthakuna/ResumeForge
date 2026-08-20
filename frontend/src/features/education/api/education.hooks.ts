import { createSubResourceHooks } from '@/lib/createSubResourceHooks'
import { educationApi } from './education.api'
import type { EducationRequest, EducationResponse } from '@/types/api'

export const {
  useAdd: useAddEducation,
  useUpdate: useUpdateEducation,
  useRemove: useRemoveEducation,
} = createSubResourceHooks<EducationRequest, EducationResponse>(educationApi, 'Education')
