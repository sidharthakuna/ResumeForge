import { z } from 'zod'

export const experienceSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  description: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  currentlyWorking: z.boolean(),
})
export type ExperienceFormValues = z.infer<typeof experienceSchema>
