import type { FullResumeResponse } from '@/types/api'
import { esc, type TemplateDefinition } from './types'
import {
  emeraldSidebarStyles,
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
  const photoUrl = personalInfo?.photoUrl || null

  const strengthsList = (resume.strengths ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
${emeraldSidebarStyles}
</style></head>
<body>
<div class="page">

  <!-- ==================== LEFT SIDEBAR ==================== -->
  <div class="sidebar">
    <div class="photo-container">
      ${
        photoUrl
          ? `<img src="${photoUrl}" class="profile-photo" alt="Profile" />`
          : `<div class="photo-placeholder">${esc(name.substring(0, 1))}</div>`
      }
    </div>

    <div class="name">${name}</div>
    ${jobTitle ? `<div class="title">${jobTitle}</div>` : ''}

    <!-- Contact Details -->
    <div class="sidebar-section-title">Contact</div>
    ${renderContact(personalInfo, { showIcons: false, format: 'sidebar' })}

    <!-- Skills -->
    ${renderSkills(skills, { format: 'sidebar' })}

    <!-- Languages -->
    ${renderLanguages(languages, 'sidebar')}

    <!-- Certifications -->
    ${renderCertifications(certifications, 'sidebar')}

    <!-- Awards & Honors -->
    ${renderAchievements(achievements, 'sidebar')}
  </div>

  <!-- ==================== RIGHT MAIN CONTENT ==================== -->
  <div class="main-content">
    <!-- 1. Professional Summary -->
    ${renderSummary(resume.summary, 'Summary')}

    <!-- 2. Education -->
    ${renderEducation(education)}

    <!-- 3. Work Experience -->
    ${renderExperience(experience)}

    <!-- 4. Projects -->
    ${renderProjects(projects)}

    <!-- 5. Key Strengths -->
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

    <!-- 6. Declaration -->
    ${renderDeclaration(resume.declaration, name)}
  </div>

</div>
</body></html>`
}

export const emeraldSidebarTemplate: TemplateDefinition = {
  id: 'emerald-sidebar',
  name: 'Emerald Sidebar',
  description: 'Executive two-column layout with dark forest-green sidebar, circular profile photo, structured credentials and clean white canvas.',
  badge: 'Photo / Modern',
  render,
}
