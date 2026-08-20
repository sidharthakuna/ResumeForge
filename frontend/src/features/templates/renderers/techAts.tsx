import type { FullResumeResponse } from '@/types/api'
import { esc, type TemplateDefinition } from './types'
import {
  techAtsStyles,
  renderContact,
  renderSkills,
  renderLanguages,
  renderCertifications,
  renderAchievements,
  renderSummary,
  renderEducation,
  renderExperience,
  renderProjects,
  renderDeclaration,
} from '../modules'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  const name = esc(personalInfo?.fullName) || 'Alex Rivera'
  const jobTitle = esc(personalInfo?.jobTitle || resume.title || '')

  const strengthsList = (resume.strengths ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
${techAtsStyles}
</style></head>
<body>
<div class="page">

  <!-- ATS Header -->
  <div class="header">
    <div class="name">${name}</div>
    ${jobTitle ? `<div class="role">${jobTitle}</div>` : ''}
    <div class="contact-line">
      ${renderContact(personalInfo, { showIcons: false, format: 'inline', separator: ' | ' })}
    </div>
  </div>

  <!-- 1. Summary -->
  ${renderSummary(resume.summary, 'Professional Summary', 'h2')}

  <!-- 2. Experience -->
  ${renderExperience(experience, { titleTag: 'h2', sectionTitle: 'Experience' })}

  <!-- 3. Projects -->
  ${renderProjects(projects, { titleTag: 'h2', sectionTitle: 'Projects' })}

  <!-- 4. Education -->
  ${renderEducation(education, { titleTag: 'h2', sectionTitle: 'Education' })}

  <!-- 5. Technical Skills -->
  ${renderSkills(skills, { titleTag: 'h2', format: 'rows', sectionTitle: 'Technical Skills' })}

  <!-- 6. Certifications -->
  ${renderCertifications(certifications, 'inline', 'h2')}

  <!-- 7. Achievements -->
  ${renderAchievements(achievements, 'inline', 'h2')}

  <!-- 8. Languages -->
  ${renderLanguages(languages, 'inline', 'h2')}

  <!-- 9. Strengths -->
  ${
    strengthsList.length
      ? `<div class="section">
           <div class="sec-title">Strengths</div>
           <ul class="bullets">
             ${strengthsList.map((st) => `<li>${esc(st.replace(/^[•*-]\s*/, ''))}</li>`).join('')}
           </ul>
         </div>`
      : ''
  }

  <!-- 10. Declaration -->
  ${renderDeclaration(resume.declaration, name, 'h2')}

</div>
</body></html>`
}

export const techAtsTemplate: TemplateDefinition = {
  id: 'tech-ats',
  name: 'Tech ATS (Single Column)',
  description: 'ATS-optimized linear layout with high parseability, clean standard headings, and semantic hierarchy.',
  badge: 'ATS Friendly',
  render,
}
