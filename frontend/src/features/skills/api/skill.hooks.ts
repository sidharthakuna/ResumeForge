import { createSubResourceHooks } from '@/lib/createSubResourceHooks'
import { skillApi } from './skill.api'
import type { SkillRequest, SkillResponse } from '@/types/api'

export const {
  useAdd: useAddSkill,
  useUpdate: useUpdateSkill,
  useRemove: useRemoveSkill,
} = createSubResourceHooks<SkillRequest, SkillResponse>(skillApi, 'Skill')
