import type { FullResumeResponse } from '@/types/api'
import { sampleResume } from '../lib/sample-resume'

/**
 * Returns a complete resume response, falling back to rich student developer
 * placeholder demonstration data for any section that is currently empty.
 */
export function withPlaceholders(full: FullResumeResponse): FullResumeResponse {
  const hasCustomPersonalInfo =
    full.personalInfo &&
    (full.personalInfo.fullName !== 'Your Name' ||
      full.personalInfo.email !== 'user@example.com' ||
      full.personalInfo.phone ||
      full.personalInfo.photoUrl)

  const personalInfo = hasCustomPersonalInfo
    ? full.personalInfo
    : sampleResume.personalInfo
      ? {
          id: full.personalInfo?.id || sampleResume.personalInfo.id,
          fullName: sampleResume.personalInfo.fullName,
          email: sampleResume.personalInfo.email,
          jobTitle: sampleResume.personalInfo.jobTitle,
          phone: sampleResume.personalInfo.phone,
          location: sampleResume.personalInfo.location,
          linkedinUrl: sampleResume.personalInfo.linkedinUrl,
          githubUrl: sampleResume.personalInfo.githubUrl,
          portfolioUrl: sampleResume.personalInfo.portfolioUrl,
          photoUrl: full.personalInfo?.photoUrl || sampleResume.personalInfo.photoUrl || null,
        }
      : null

  const hasCustomSummary = full.resume.summary && full.resume.summary.trim().length > 0
  const summary = hasCustomSummary ? full.resume.summary : sampleResume.resume.summary

  const hasCustomEducation = full.education && full.education.length > 0
  const education = hasCustomEducation ? full.education : sampleResume.education

  const hasCustomExperience = full.experience && full.experience.length > 0
  const experience = hasCustomExperience ? full.experience : sampleResume.experience

  const hasCustomProjects = full.projects && full.projects.length > 0
  const projects = hasCustomProjects ? full.projects : sampleResume.projects

  const hasCustomSkills = full.skills && full.skills.length > 0
  const skills = hasCustomSkills ? full.skills : sampleResume.skills

  const hasCustomCertifications = full.certifications && full.certifications.length > 0
  const certifications = hasCustomCertifications ? full.certifications : sampleResume.certifications

  const hasCustomAchievements = full.achievements && full.achievements.length > 0
  const achievements = hasCustomAchievements ? full.achievements : sampleResume.achievements

  const hasCustomLanguages = full.languages && full.languages.length > 0
  const languages = hasCustomLanguages ? full.languages : sampleResume.languages

  const hasCustomStrengths = full.resume.strengths && full.resume.strengths.trim().length > 0
  const strengths = hasCustomStrengths ? full.resume.strengths : sampleResume.resume.strengths

  const hasCustomDeclaration = full.resume.declaration && full.resume.declaration.trim().length > 0
  const declaration = hasCustomDeclaration ? full.resume.declaration : sampleResume.resume.declaration

  return {
    ...full,
    resume: {
      ...full.resume,
      title: full.resume.title && full.resume.title !== 'Untitled resume' ? full.resume.title : sampleResume.resume.title,
      summary,
      strengths,
      declaration,
    },
    personalInfo,
    education,
    experience,
    projects,
    skills,
    certifications,
    achievements,
    languages,
  }
}
