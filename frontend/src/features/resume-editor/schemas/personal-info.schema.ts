import { z } from 'zod'

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val || val === '') return true
      try {
        const urlToTest = /^https?:\/\//i.test(val) ? val : `https://${val}`
        new URL(urlToTest)
        return true
      } catch {
        return false
      }
    },
    { message: 'Enter a valid URL (e.g. linkedin.com/in/you or https://...)' },
  )

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  jobTitle: z.string().optional().or(z.literal('')),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  photoUrl: z.string().optional().nullable().or(z.literal('')),
})
export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>
