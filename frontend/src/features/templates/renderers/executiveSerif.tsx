import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  const contactItems = [
    personalInfo?.phone ? esc(personalInfo.phone) : '',
    personalInfo?.location ? esc(personalInfo.location) : '',
    personalInfo?.email ? esc(personalInfo.email) : '',
    personalInfo?.githubUrl ? esc(personalInfo.githubUrl) : '',
    personalInfo?.linkedinUrl ? esc(personalInfo.linkedinUrl) : '',
    personalInfo?.portfolioUrl ? esc(personalInfo.portfolioUrl) : '',
  ].filter(Boolean)

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page { font-family: Georgia, 'Times New Roman', serif; color: #111111; line-height: 1.45; }
  h1 { font-family: Georgia, serif; font-size: 27px; font-weight: 700; text-align: center; margin: 0 0 6px; letter-spacing: -0.3px; color: #111111; }
  .contact { font-size: 11.5px; text-align: center; color: #444444; margin-bottom: 12px; }
  .contact span:not(:last-child)::after { content: '  |  '; color: #777777; font-weight: 300; }
  .header-rule { border-bottom: 1.5px solid #222222; margin-bottom: 18px; }
  h2 { font-family: Georgia, serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #111111; font-weight: 700; border-bottom: 1px solid #333333; padding-bottom: 3px; margin: 18px 0 10px; }
  .entry { margin-bottom: 13px; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 700; font-size: 13.5px; color: #111111; }
  .entry-sub { font-size: 12.5px; color: #333333; }
  .entry-date { font-size: 11.5px; color: #444444; white-space: nowrap; font-style: normal; }
  .location-right { font-style: italic; color: #555555; }
  .entry-desc { font-size: 12px; color: #222222; margin-top: 4px; line-height: 1.5; }
  .summary { font-size: 12.5px; line-height: 1.6; color: #222222; text-align: justify; }
  .skills-row { font-size: 12px; color: #222222; line-height: 1.7; }
  .tag { display: inline-block; }
  .tag:not(:last-child)::after { content: '  •  '; color: #666666; }
</style></head>
<body><div class="page">
  <h1>${esc(personalInfo?.fullName) || 'Your Name'}</h1>
  <div class="contact">
    ${contactItems.map((v) => `<span>${v}</span>`).join('')}
  </div>
  <div class="header-rule"></div>

  ${resume.summary ? `<h2>Summary</h2><p class="summary">${esc(resume.summary)}</p>` : ''}

  ${
    experience.length
      ? `<h2>Experience</h2>${experience
          .map(
            (e) => `<div class="entry">
        <div class="entry-head">
          <span class="entry-title">${esc(e.jobTitle)}</span>
          <span class="entry-date">${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate)}</span>
        </div>
        <div class="entry-head" style="margin-top: 1px;">
          <span class="entry-sub">${esc(e.company)}</span>
          ${(e as any).location ? `<span class="entry-date location-right">${esc((e as any).location)}</span>` : ''}
        </div>
        ${e.description ? `<div class="entry-desc">${esc(e.description)}</div>` : ''}
      </div>`,
          )
          .join('')}`
      : ''
  }

  ${
    education.length
      ? `<h2>Education</h2>${education
          .map(
            (ed) => `<div class="entry">
        <div class="entry-head">
          <span class="entry-title">${esc(ed.degree)}${ed.fieldOfStudy ? ` in ${esc(ed.fieldOfStudy)}` : ''}</span>
          <span class="entry-date">${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</span>
        </div>
        <div class="entry-sub">${esc(ed.institution)}</div>
      </div>`,
          )
          .join('')}`
      : ''
  }

  ${
    projects.length
      ? `<h2>Projects</h2>${projects
          .map(
            (p) => `<div class="entry">
        <div class="entry-title">${esc(p.title)}</div>
        ${p.description ? `<div class="entry-desc">${esc(p.description)}</div>` : ''}
      </div>`,
          )
          .join('')}`
      : ''
  }

  ${skills.length ? `<h2>Skills</h2><div class="skills-row">${skills.map((s) => `<span class="tag">${esc(s.name)}</span>`).join('')}</div>` : ''}

  ${
    certifications.length
      ? `<h2>Certifications</h2>${certifications
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

  ${
    achievements.length
      ? `<h2>Achievements</h2>${achievements
          .map((a) => `<div class="entry"><div class="entry-title">${esc(a.title)}</div>${a.description ? `<div class="entry-desc">${esc(a.description)}</div>` : ''}</div>`)
          .join('')}`
      : ''
  }

  ${languages.length ? `<h2>Languages</h2><div class="skills-row">${languages.map((l) => `<span class="tag">${esc(l.languageName)}</span>`).join('')}</div>` : ''}

  ${resume.declaration ? `<h2>Declaration</h2><p class="summary">${esc(resume.declaration)}</p>` : ''}
</div></body></html>`
}

export const executiveSerifTemplate: TemplateDefinition = {
  id: 'executive-serif',
  name: 'Executive Serif',
  description: 'Classic serif typography with centered header and refined divider lines. Ideal for legal, corporate & executive roles.',
  badge: 'Executive',
  render,
}
