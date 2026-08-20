import { z } from 'zod'

export const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuingOrganization: z.string().min(1, 'Issuing organization is required'),
  issueDate: z.string().optional().or(z.literal('')),
  expirationDate: z.string().optional().or(z.literal('')),
  credentialId: z.string().optional().or(z.literal('')),
  credentialUrl: z.string().url('Enter a full URL').optional().or(z.literal('')),
})
export type CertificationFormValues = z.infer<typeof certificationSchema>
