import { z } from 'zod'

// Matches backend ProficiencyLevel enum exactly (NATIVE, FLUENT,
// PROFESSIONAL, CONVERSATIONAL, BASIC) — read from ProficiencyLevel.java.
export const proficiencyLevels = ['NATIVE', 'FLUENT', 'PROFESSIONAL', 'CONVERSATIONAL', 'BASIC'] as const

export const languageSchema = z.object({
  languageName: z.string().min(1, 'Language is required'),
  proficiencyLevel: z.enum(proficiencyLevels),
})
export type LanguageFormValues = z.infer<typeof languageSchema>

export const proficiencyLabels: Record<(typeof proficiencyLevels)[number], string> = {
  NATIVE: 'Native',
  FLUENT: 'Fluent',
  PROFESSIONAL: 'Professional',
  CONVERSATIONAL: 'Conversational',
  BASIC: 'Basic',
}
