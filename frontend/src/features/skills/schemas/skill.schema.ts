import { z } from 'zod'

// Backend SkillRequest/Response has ONLY `name` — confirmed by reading
// SkillRequest.java/SkillResponse.java directly. No proficiency, no
// category. Do not add fields here; the API will silently ignore extras.
export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
})
export type SkillFormValues = z.infer<typeof skillSchema>
