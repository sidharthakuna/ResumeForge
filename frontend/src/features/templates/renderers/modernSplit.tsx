import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  const contactItems = [
    personalInfo?.email ? `✉ ${esc(personalInfo.email)}` : '',
    personalInfo?.phone ? `☎ ${esc(personalInfo.phone)}` : '',
    personalInfo?.location ? `📍 ${esc(personalInfo.location)}` : '',
    personalInfo?.linkedinUrl ? `🔗 ${esc(personalInfo.linkedinUrl)}` : '',
    personalInfo?.portfolioUrl ? `🌐 ${esc(personalInfo.portfolioUrl)}` : '',
  ].filter(Boolean)

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page { padding: 22mm 20mm; font-family: 'Inter', -apple-system, sans-serif; color: #111827; background: #ffffff; }
  
  .header { margin-bottom: 22px; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; }
  .name { font-size: 30px; font-weight: 700; text-transform: uppercase; letter-spacing: -0.2px; color: #111827; margin: 0; }
  .title { font-size: 15px; font-weight: 600; color: #2563eb; margin-top: 4px; }
  
  .contact-row { display: flex; flex-wrap: wrap; gap: 14px 20px; font-size: 11.5px; color: #4b5563; margin-top: 10px; }
  .contact-item { font-weight: 500; }

  .two-col { display: flex; width: 100%; gap: 24px; }
  .left-main { width: 60%; }
  .right-side { width: 40%; }

  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #111827; border-bottom: 2px solid #111827; padding-bottom: 4px; margin: 0 0 14px; }
  .right-side .section-title { margin-top: 0; }
  .left-main .section-title { margin-top: 0; }
  
  .entry { margin-bottom: 16px; }
  .entry-role { font-size: 14px; font-weight: 700; color: #111827; }
  .entry-company { font-size: 12.5px; font-weight: 600; color: #2563eb; margin-top: 1px; }
  .entry-meta { font-size: 11px; color: #6b7280; margin: 2px 0 6px; display: flex; gap: 12px; }
  .entry-desc { font-size: 12px; color: #374151; line-height: 1.5; }

  .summary { font-size: 12.5px; line-height: 1.6; color: #374151; margin-bottom: 18px; }

  .skill-group-title { font-size: 12px; font-weight: 700; color: #2563eb; margin: 10px 0 4px; }
  .skill-list { font-size: 11.5px; color: #374151; line-height: 1.6; }
</style></head>
<body><div class="page">
  <div class="header">
    <h1 class="name">${esc(personalInfo?.fullName) || 'Your Name'}</h1>
    <div class="title">${esc(resume.title) || 'Computer Technician'}</div>
    ${
      contactItems.length
        ? `<div class="contact-row">${contactItems.map((item) => `<span class="contact-item">${item}</span>`).join('')}</div>`
        : ''
    }
  </div>

  <div class="two-col">
    <div class="left-main">
      ${resume.summary ? `<div class="section-title">Summary</div><p class="summary">${esc(resume.summary)}</p>` : ''}

      ${
        experience.length
          ? `<div class="section-title">Work Experience</div>${experience
              .map(
                (e) => `<div class="entry">
            <div class="entry-role">${esc(e.jobTitle)}</div>
            <div class="entry-company">${esc(e.company)}</div>
            <div class="entry-meta">
              <span>📅 ${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Current' : fmtDate(e.endDate)}</span>
              ${(e as any).location ? `<span>📍 ${esc((e as any).location)}</span>` : ''}
            </div>
            ${e.description ? `<div class="entry-desc">${esc(e.description)}</div>` : ''}
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        projects.length
          ? `<div class="section-title">Projects</div>${projects
              .map(
                (p) => `<div class="entry">
            <div class="entry-role">${esc(p.title)}</div>
            ${p.description ? `<div class="entry-desc">${esc(p.description)}</div>` : ''}
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${resume.declaration ? `<div class="section-title">Declaration</div><p class="summary">${esc(resume.declaration)}</p>` : ''}
    </div>

    <div class="right-side">
      ${
        education.length
          ? `<div class="section-title">Education</div>${education
              .map(
                (ed) => `<div class="entry">
            <div class="entry-role" style="font-size: 13px;">${esc(ed.degree)}</div>
            ${ed.fieldOfStudy ? `<div class="entry-desc" style="font-weight: 500;">${esc(ed.fieldOfStudy)}</div>` : ''}
            <div class="entry-company">${esc(ed.institution)}</div>
            <div class="entry-meta">
              <span>📅 ${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</span>
            </div>
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        skills.length
          ? `<div class="section-title">Skills</div>
             <div class="skill-group-title">Technical & Core Skills</div>
             <div class="skill-list">
               ${skills.map((s) => `• ${esc(s.name)}`).join('<br/>')}
             </div>`
          : ''
      }

      ${
        certifications.length
          ? `<div class="section-title" style="margin-top: 18px;">Certifications</div>${certifications
              .map(
                (c) => `<div class="entry">
            <div class="entry-role" style="font-size: 12.5px;">${esc(c.name)}</div>
            <div class="entry-company" style="font-size: 11.5px;">${esc(c.issuingOrganization)} — ${fmtDate(c.issueDate)}</div>
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        achievements.length
          ? `<div class="section-title" style="margin-top: 18px;">Achievements</div>${achievements
              .map(
                (a) => `<div class="entry">
            <div class="entry-role" style="font-size: 12.5px;">${esc(a.title)}</div>
            ${a.issuer ? `<div class="entry-company" style="font-size: 11.5px;">${esc(a.issuer)}${a.achievementDate ? ` — ${fmtDate(a.achievementDate)}` : ''}</div>` : ''}
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        languages.length
          ? `<div class="section-title" style="margin-top: 18px;">Languages</div>
             <div class="skill-list">
               ${languages.map((l) => `• ${esc(l.languageName)}`).join('<br/>')}
             </div>`
          : ''
      }
    </div>
  </div>
</div></body></html>`
}

export const modernSplitTemplate: TemplateDefinition = {
  id: 'modern-split',
  name: 'Modern Split',
  description: 'Clean two-column technical resume with vibrant royal blue headers, date badges, and distinct skill groups.',
  badge: 'ATS Friendly',
  render,
}
