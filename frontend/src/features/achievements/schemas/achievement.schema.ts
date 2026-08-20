import { z } from 'zod'

export const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  issuer: z.string().optional().or(z.literal('')),
  achievementDate: z.string().optional().or(z.literal('')),
})
export type AchievementFormValues = z.infer<typeof achievementSchema>
