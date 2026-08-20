import type { FullResumeResponse } from '@/types/api'
import { esc, type TemplateDefinition } from './types'
import {
  techModernStyles,
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
${techModernStyles}
</style></head>
<body>
<div class="page">

  <!-- Header Section -->
  <div class="header">
    <div class="header-left">
      <div class="name">${name}</div>
      ${jobTitle ? `<div class="role">${jobTitle}</div>` : ''}
    </div>
    <div class="header-right">
      ${renderContact(personalInfo, { showIcons: true, format: 'stacked', linkClass: 'contact-link' })}
    </div>
  </div>

  <!-- 1. Professional Summary -->
  ${renderSummary(resume.summary, 'Professional Summary')}

  <!-- 2. Technical Skills -->
  ${renderSkills(skills, { format: 'table', sectionTitle: 'Technical Skills' })}

  <!-- 3. Work Experience -->
  ${renderExperience(experience, { sectionTitle: 'Experience' })}

  <!-- 4. Projects -->
  ${renderProjects(projects, { sectionTitle: 'Projects' })}

  <!-- 5. Education -->
  ${renderEducation(education, { sectionTitle: 'Education' })}

  <!-- 6. Grid: Certifications & Achievements -->
  ${
    (certifications && certifications.length > 0) || (achievements && achievements.length > 0)
      ? `<div class="grid-2">
          <div>${renderCertifications(certifications)}</div>
          <div>${renderAchievements(achievements)}</div>
        </div>`
      : ''
  }

  <!-- 7. Languages -->
  ${renderLanguages(languages)}

  <!-- 8. Strengths -->
  ${
    strengthsList.length
      ? `<div class="section">
           <div class="section-title">Strengths</div>
           <ul class="bullets">
             ${strengthsList.map((st) => `<li>${esc(st.replace(/^[•*-]\s*/, ''))}</li>`).join('')}
           </ul>
         </div>`
      : ''
  }

  <!-- 9. Declaration -->
  ${renderDeclaration(resume.declaration, name)}

</div>
</body></html>`
}

export const techModernTemplate: TemplateDefinition = {
  id: 'tech-modern',
  name: 'Tech Modern (2-Column Header)',
  description: 'Clean engineer layout with blue accent header, right-aligned contact card, categorized technical skills table, and prominent projects.',
  badge: 'Developer / Modern',
  render,
}
