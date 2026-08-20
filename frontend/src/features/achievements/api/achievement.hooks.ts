import { createSubResourceHooks } from '@/lib/createSubResourceHooks'
import { achievementApi } from './achievement.api'
import type { AchievementRequest, AchievementResponse } from '@/types/api'

export const {
  useAdd: useAddAchievement,
  useUpdate: useUpdateAchievement,
  useRemove: useRemoveAchievement,
} = createSubResourceHooks<AchievementRequest, AchievementResponse>(achievementApi, 'Achievement')
