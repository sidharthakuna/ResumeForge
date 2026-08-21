/**
 * These types are hand-mirrored from the actual Spring Boot DTOs in
 * resume-abc.zip (com.resumebuilder.*.dto.*). Every field name, optionality,
 * and enum value below was read directly from the Java source — none of
 * this is guessed or inferred from the frontend that was already built.
 *
 * If you add/rename a field on the backend, update the matching type here.
 */

// ---- Envelope -------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string | null
}

// ---- Enums ------------------------------------------------------------

export type ResumeStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED'

export type ProficiencyLevel =
  | 'NATIVE'
  | 'FLUENT'
  | 'PROFESSIONAL'
  | 'CONVERSATIONAL'
  | 'BASIC'

/** Backend templates corresponding to ResumeTemplate.java */
export type BackendResumeTemplate =
  | 'MODERN'
  | 'CLASSIC'
  | 'EXECUTIVE_SERIF'
  | 'NAVY_BANNER'
  | 'SIDEBAR_MINIMALIST'
  | 'MODERN_SPLIT'
  | 'TECH_MODERN'
  | 'TECH_ATS'
  | 'EMERALD_SIDEBAR'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface ResumeSummaryResponse {
  id: string
  title: string
  status: ResumeStatus
  updatedAt: string
}

// ---- Auth ---------------------------------------------------------------

export type OtpPurpose = 'REGISTRATION' | 'PASSWORD_RESET'

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SendOtpRequest {
  email: string
  purpose: OtpPurpose
}

export interface VerifyOtpRequest {
  email: string
  otp: string
  purpose: OtpPurpose
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
}

export interface GoogleAuthRequest {
  credential: string
}

export interface AuthResponse {
  token: string
  email: string
  fullName: string
  role: string
}


// ---- Resume ---------------------------------------------------------------

export interface CreateResumeRequest {
  title: string | null
}

export interface UpdateResumeRequest {
  title?: string | null
  summary?: string | null
  declaration?: string | null
  strengths?: string | null
}

export interface ResumeResponse {
  id: string
  title: string
  status: ResumeStatus
  summary: string | null
  declaration: string | null
  strengths: string | null
}

export interface FullResumeResponse {
  resume: ResumeResponse
  personalInfo: PersonalInfoResponse | null
  education: EducationResponse[]
  experience: ExperienceResponse[]
  projects: ProjectResponse[]
  skills: SkillResponse[]
  certifications: CertificationResponse[]
  achievements: AchievementResponse[]
  languages: LanguageResponse[]
}

// ---- Personal info (create-once, then must PUT) --------------------------

export interface PersonalInfoRequest {
  fullName: string
  jobTitle?: string | null
  email: string
  phone: string | null
  location: string | null
  linkedinUrl: string | null
  githubUrl?: string | null
  portfolioUrl: string | null
  photoUrl?: string | null
}

export interface PersonalInfoResponse {
  id: string
  fullName: string
  jobTitle: string | null
  email: string
  phone: string | null
  location: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  portfolioUrl: string | null
  photoUrl: string | null
}

// ---- Education --------------------------------------------------------

export interface EducationRequest {
  institution: string
  degree: string
  fieldOfStudy: string | null
  grade?: string | null
  startDate?: string | null // LocalDate -> "YYYY-MM-DD"
  endDate?: string | null
}

export interface EducationResponse {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string | null
  grade: string | null
  startDate: string | null
  endDate: string | null
}

// ---- Experience -------------------------------------------------------

export interface ExperienceRequest {
  company: string
  jobTitle: string
  description: string | null
  startDate?: string | null
  endDate?: string | null
  currentlyWorking: boolean
}

export interface ExperienceResponse {
  id: string
  company: string
  jobTitle: string
  description: string | null
  startDate: string | null
  endDate: string | null
  currentlyWorking: boolean
}

// ---- Projects -----------------------------------------------------------

export interface ProjectRequest {
  title: string
  description: string | null
  githubUrl: string | null
  demoUrl: string | null
  startDate: string | null
  endDate: string | null
  currentlyBuilding: boolean
}

export interface ProjectResponse {
  id: string
  title: string
  description: string | null
  githubUrl: string | null
  demoUrl: string | null
  startDate: string | null
  endDate: string | null
  currentlyBuilding: boolean
}

// ---- Skills -------------------------------------------------------------
// NOTE: backend SkillRequest/Response has ONLY `name` — no proficiency,
// no category. Do not invent extra fields here; the API will ignore them
// on write and they'll never come back on read.

export interface SkillRequest {
  name: string
}

export interface SkillResponse {
  id: string
  name: string
}

// ---- Certifications -------------------------------------------------------

export interface CertificationRequest {
  name: string
  issuingOrganization: string
  issueDate?: string | null
  expirationDate?: string | null
  credentialId?: string | null
  credentialUrl?: string | null
}

export interface CertificationResponse {
  id: string
  name: string
  issuingOrganization: string
  issueDate: string | null
  expirationDate: string | null
  credentialId: string | null
  credentialUrl: string | null
}

// ---- Achievements -----------------------------------------------------

export interface AchievementRequest {
  title: string
  description?: string | null
  issuer?: string | null
  achievementDate?: string | null
}

export interface AchievementResponse {
  id: string
  title: string
  description: string | null
  issuer: string | null
  achievementDate: string | null
}

// ---- Languages ----------------------------------------------------------

export interface LanguageRequest {
  languageName: string
  proficiencyLevel: ProficiencyLevel
}

export interface LanguageResponse {
  id: string
  languageName: string
  proficiencyLevel: ProficiencyLevel
}

// ---- AI -------------------------------------------------------------------

export interface GenerateSummaryRequest {
  targetJobTitle: string | null
  targetJobDescription: string | null
}

export interface GenerateDeclarationRequest {
  city: string | null
}

export type MatchClassification = 'MATCH' | 'PARTIAL_MATCH' | 'MISSING' | 'UNKNOWN'

export interface SkillMatchItem {
  skill: string
  classification: MatchClassification
  candidateContext: string
}

export interface JobAnalysisRequest {
  targetJobTitle?: string | null
  targetJobDescription?: string | null
}

export interface JobAnalysisResponse {
  jobTitle: string
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
  keywords: string[]
  skillMatches: SkillMatchItem[]
  missingSkills: string[]
  matchScore: number
}

export interface AiSummaryPreviewResponse {
  summary: string
  jobTitle: string
  matchedSkills: string[]
  missingSkills: string[]
  tailoredFocus: string
}

export interface AiExperienceRequest {
  experienceId?: string | null
  company?: string | null
  jobTitle?: string | null
  currentDescription?: string | null
  targetJobTitle?: string | null
  targetJobDescription?: string | null
}

export interface AiExperienceResponse {
  experienceId: string | null
  company: string | null
  jobTitle: string | null
  bullets: string[]
  matchedKeywords: string[]
}

export interface AiProjectRequest {
  projectId?: string | null
  title?: string | null
  currentDescription?: string | null
  readmeContent?: string | null
  targetJobTitle?: string | null
  targetJobDescription?: string | null
}

export interface AiProjectResponse {
  projectId: string | null
  title: string | null
  bullets: string[]
  extractedTech: string[]
  matchedKeywords: string[]
}

export interface SkillPrioritizationRequest {
  targetJobTitle?: string | null
  targetJobDescription?: string | null
}

export interface SkillPrioritizationResponse {
  prioritizedSkills: string[]
  matchedCount: number
  missingSuggestions: string[]
}

export interface AtsAnalysisRequest {
  targetJobTitle?: string | null
  targetJobDescription?: string | null
}

export interface AtsAnalysisResponse {
  score: number
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: string[]
  strengths: string[]
  formattingWarnings: string[]
}

export interface TailoredExperienceItem {
  experienceId: string | null
  company: string | null
  jobTitle: string | null
  bullets: string[]
}

export interface TailoredProjectItem {
  projectId: string | null
  title: string | null
  bullets: string[]
  techStack: string[]
}

export interface ResumeTailoringRequest {
  targetJobTitle?: string | null
  targetJobDescription?: string | null
}

export interface ResumeTailoringResponse {
  summary: string
  experience: TailoredExperienceItem[]
  projects: TailoredProjectItem[]
  prioritizedSkills: string[]
  matchedSkills: string[]
  missingSkills: string[]
  atsAnalysis: AtsAnalysisResponse
}

export interface ParseMarkdownRequest {
  markdownContent: string
}

export interface ParseMarkdownResponse {
  projectName: string
  summary: string
  technologies: string[]
  keyFeatures: string[]
  architecturePoints: string[]
  databaseAndApis: string[]
}

// ---- Templates (backend Thymeleaf catalog) ---------------------------------

export interface TemplateResponse {
  id: string
  displayName: string
}

export interface TemplateListResponse {
  templates: TemplateResponse[]
}

// ---- Generation / export -------------------------------------------------

export interface GenerateResumeResponse {
  generatedResumeId: string
  downloadUrl: string
  generatedAt: string // LocalDateTime
}

export interface GeneratedResumeSummary {
  id: string
  downloadUrl: string
  generatedAt: string
  /** Free-text label the FRONTEND supplied when it generated this file — not backend-validated. */
  frontendTemplateName: string | null
}

export interface GenerateFromHtmlRequest {
  html: string
  templateName: string | null
}
