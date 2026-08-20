import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function getProficiencyPercentage(level: string | null | undefined): number {
  if (!level) return 75
  const l = level.toUpperCase()
  if (l.includes('BEGINNER')) return 40
  if (l.includes('INTERMEDIATE')) return 65
  if (l.includes('ADVANCED')) return 85
  if (l.includes('EXPERT') || l.includes('NATIVE') || l.includes('FLUENT')) return 100
  return 75
}

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  const initials = (personalInfo?.fullName || 'CH')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page { padding: 0; font-family: 'Inter', -apple-system, sans-serif; color: #222222; background: #ffffff; }
  .content-wrapper { display: flex; width: 100%; min-height: 297mm; }
  .sidebar { width: 33%; background-color: #f0f2f5; padding: 28px 18px; border-right: 1px solid #e2e6eb; box-sizing: border-box; }
  .main-content { width: 67%; padding: 28px 26px; box-sizing: border-box; }

  .avatar { width: 84px; height: 84px; border-radius: 50%; background: #2c3e50; color: #ffffff; font-size: 28px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.12); overflow: hidden; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sidebar-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.6px; color: #111111; margin: 20px 0 10px; border-bottom: 1px solid #d2d7df; padding-bottom: 3px; }
  .sidebar-section-title:first-of-type { margin-top: 0; }

  .side-item { font-size: 11px; color: #444444; margin-bottom: 8px; word-break: break-word; line-height: 1.4; }
  .side-label { font-weight: 600; color: #111111; }

  .bar-container { background: #dce1e7; height: 6px; border-radius: 3px; margin-top: 4px; overflow: hidden; }
  .bar-fill { background: #111111; height: 100%; border-radius: 3px; }

  .main-header { margin-bottom: 22px; border-bottom: 1px solid #e2e6eb; padding-bottom: 14px; }
  .main-name { font-size: 28px; font-weight: 700; letter-spacing: -0.2px; color: #111111; margin: 0; }
  .main-subtitle { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #555555; margin-top: 4px; }

  .main-section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.6px; color: #111111; border-bottom: 1px solid #111111; padding-bottom: 3px; margin: 22px 0 12px; }
  .main-section-title:first-of-type { margin-top: 0; }

  .entry { margin-bottom: 16px; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 700; font-size: 13.5px; color: #111111; }
  .entry-sub { font-size: 12px; font-weight: 500; color: #444444; margin-top: 2px; }
  .entry-date { font-size: 11px; color: #666666; white-space: nowrap; }
  .entry-desc { font-size: 12px; color: #333333; margin-top: 5px; line-height: 1.5; }

  .summary { font-size: 12.5px; line-height: 1.6; color: #333333; }

  .skills-grid { display: flex; flex-wrap: wrap; gap: 12px 16px; }
  .skill-card { width: 46%; }
  .skill-name { font-size: 11.5px; font-weight: 600; color: #111111; }
</style></head>
<body><div class="page">
  <div class="content-wrapper">
    <div class="sidebar">
      <div class="avatar">
        ${
          personalInfo?.photoUrl
            ? `<img src="${personalInfo.photoUrl}" alt="Profile avatar" />`
            : initials
        }
      </div>

      <div class="sidebar-section-title">Contact</div>
      ${personalInfo?.phone ? `<div class="side-item"><span class="side-label">Phone:</span><br/>${esc(personalInfo.phone)}</div>` : ''}
      ${personalInfo?.email ? `<div class="side-item"><span class="side-label">Email:</span><br/>${esc(personalInfo.email)}</div>` : ''}
      ${personalInfo?.location ? `<div class="side-item"><span class="side-label">Location:</span><br/>${esc(personalInfo.location)}</div>` : ''}

      ${
        personalInfo?.linkedinUrl || personalInfo?.portfolioUrl
          ? `<div class="sidebar-section-title">Links</div>
             ${personalInfo.linkedinUrl ? `<div class="side-item"><span class="side-label">LinkedIn:</span><br/>${esc(personalInfo.linkedinUrl)}</div>` : ''}
             ${personalInfo.portfolioUrl ? `<div class="side-item"><span class="side-label">Portfolio:</span><br/>${esc(personalInfo.portfolioUrl)}</div>` : ''}`
          : ''
      }

      ${
        languages.length
          ? `<div class="sidebar-section-title">Languages</div>
             ${languages
               .map(
                 (l) => `<div class="side-item">
               <span class="side-label">${esc(l.languageName)}</span>
               <div class="bar-container"><div class="bar-fill" style="width: ${getProficiencyPercentage(l.proficiencyLevel)}%;"></div></div>
             </div>`,
               )
               .join('')}`
          : ''
      }

      ${
        achievements.length
          ? `<div class="sidebar-section-title">Hobbies & Achievements</div>
             ${achievements.map((a) => `<div class="side-item">• ${esc(a.title)}</div>`).join('')}`
          : ''
      }
    </div>

    <div class="main-content">
      <div class="main-header">
        <h1 class="main-name">${esc(personalInfo?.fullName) || 'Your Name'}</h1>
        <div class="main-subtitle">${esc(resume.title) || 'Computer Science Student'}</div>
      </div>

      ${resume.summary ? `<div class="main-section-title">About Me</div><p class="summary">${esc(resume.summary)}</p>` : ''}

      ${
        experience.length
          ? `<div class="main-section-title">Work Experience</div>${experience
              .map(
                (e) => `<div class="entry">
            <div class="entry-head">
              <span class="entry-title">${esc(e.jobTitle)}</span>
              <span class="entry-date">${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate)}</span>
            </div>
            <div class="entry-sub">${esc(e.company)}${(e as any).location ? ` / ${esc((e as any).location)}` : ''}</div>
            ${e.description ? `<div class="entry-desc">${esc(e.description)}</div>` : ''}
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        education.length
          ? `<div class="main-section-title">Education</div>${education
              .map(
                (ed) => `<div class="entry">
            <div class="entry-head">
              <span class="entry-title">${esc(ed.degree)}</span>
              <span class="entry-date">${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</span>
            </div>
            <div class="entry-sub">${esc(ed.institution)}${ed.fieldOfStudy ? ` / ${esc(ed.fieldOfStudy)}` : ''}</div>
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        projects.length
          ? `<div class="main-section-title">Projects</div>${projects
              .map(
                (p) => `<div class="entry">
            <div class="entry-title">${esc(p.title)}</div>
            ${p.description ? `<div class="entry-desc">${esc(p.description)}</div>` : ''}
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        skills.length
          ? `<div class="main-section-title">Skills</div>
             <div class="skills-grid">
               ${skills
                 .map(
                   (s) => `<div class="skill-card">
                 <div class="skill-name">${esc(s.name)}</div>
                 <div class="bar-container"><div class="bar-fill" style="width: ${getProficiencyPercentage((s as any).proficiencyLevel)}%;"></div></div>
               </div>`,
                 )
                 .join('')}
             </div>`
          : ''
      }

      ${
        certifications.length
          ? `<div class="main-section-title">Certifications</div>${certifications
              .map(
                (c) => `<div class="entry">
            <div class="entry-head">
              <span class="entry-title">${esc(c.name)}</span>
              <span class="entry-date">${fmtDate(c.issueDate)}</span>
            </div>
            <div class="entry-sub">${esc(c.issuingOrganization)}</div>
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${resume.declaration ? `<div class="main-section-title">Declaration</div><p class="summary">${esc(resume.declaration)}</p>` : ''}
    </div>
  </div>
</div></body></html>`
}

export const sidebarMinimalistTemplate: TemplateDefinition = {
  id: 'sidebar-minimalist',
  name: 'Sidebar Minimalist',
  description: 'Sleek left sidebar layout featuring an avatar badge, language progress meters, and skill proficiency indicators.',
  badge: 'Student',
  render,
}
