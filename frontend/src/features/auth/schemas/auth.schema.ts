import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email').email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Enter your full name'),
    email: z.string().min(1, 'Enter your email').email('Enter a valid email'),
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    // Client-side-only gate: there's no consent field on RegisterRequest,
    // so this is never sent to the backend — it just stops submission
    // until checked, matching the mockup's required terms checkbox.
    agreeToTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms to continue' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
export type RegisterFormValues = z.infer<typeof registerSchema>
