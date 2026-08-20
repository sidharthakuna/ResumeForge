import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().or(z.literal('')),
  githubUrl: z.string().url('Enter a full URL').optional().or(z.literal('')),
  demoUrl: z.string().url('Enter a full URL').optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  currentlyBuilding: z.boolean(),
})
export type ProjectFormValues = z.infer<typeof projectSchema>
