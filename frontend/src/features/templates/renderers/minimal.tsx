import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page { padding: 22mm 24mm; font-family: 'Inter', -apple-system, sans-serif; }
  h1 { font-family: 'Hanken Grotesk', sans-serif; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.2px; color: #191c1d; }
  .contact { font-size: 11.5px; color: #777587; margin-top: 6px; }
  .contact span:not(:last-child)::after { content: '   '; }
  h2 { font-family: 'Hanken Grotesk', sans-serif; font-size: 10.5px; text-transform: uppercase; letter-spacing: 1.8px; color: #9997a8; font-weight: 700; margin: 26px 0 12px; }
  h2:first-of-type { margin-top: 28px; }
  .entry { margin-bottom: 16px; }
  .entry-head { display: flex; justify-content: space-between; }
  .entry-title { font-weight: 600; font-size: 13.5px; color: #191c1d; }
  .entry-sub { font-size: 12px; color: #777587; margin-top: 1px; }
  .entry-date { font-size: 11px; color: #9997a8; white-space: nowrap; }
  .entry-desc { font-size: 12px; color: #464555; margin-top: 5px; line-height: 1.6; }
  .summary { font-size: 13px; line-height: 1.65; color: #33353f; max-width: 90%; }
  .skills-list { font-size: 12px; color: #464555; line-height: 1.9; }
</style></head>
<body><div class="page">
  <h1>${esc(personalInfo?.fullName) || 'Your Name'}</h1>
  <div class="contact">
    ${[personalInfo?.email, personalInfo?.phone, personalInfo?.location, personalInfo?.linkedinUrl, personalInfo?.portfolioUrl]
      .filter(Boolean)
      .map((v) => `<span>${esc(v as string)}</span>`)
      .join('')}
  </div>

  ${resume.summary ? `<h2>About</h2><p class="summary">${esc(resume.summary)}</p>` : ''}

  ${
    experience.length
      ? `<h2>Experience</h2>${experience
          .map(
            (e) => `<div class="entry">
        <div class="entry-head"><span class="entry-title">${esc(e.jobTitle)}, ${esc(e.company)}</span><span class="entry-date">${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate)}</span></div>
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
        <div class="entry-head"><span class="entry-title">${esc(ed.degree)}, ${esc(ed.institution)}</span><span class="entry-date">${fmtDate(ed.endDate) || 'Present'}</span></div>
      </div>`,
          )
          .join('')}`
      : ''
  }

  ${
    projects.length
      ? `<h2>Projects</h2>${projects
          .map((p) => `<div class="entry"><div class="entry-title">${esc(p.title)}</div>${p.description ? `<div class="entry-desc">${esc(p.description)}</div>` : ''}</div>`)
          .join('')}`
      : ''
  }

  ${skills.length ? `<h2>Skills</h2><p class="skills-list">${skills.map((s) => esc(s.name)).join('  ·  ')}</p>` : ''}

  ${
    certifications.length
      ? `<h2>Certifications</h2>${certifications
          .map((c) => `<div class="entry"><div class="entry-head"><span class="entry-title">${esc(c.name)}</span><span class="entry-date">${fmtDate(c.issueDate)}</span></div><div class="entry-sub">${esc(c.issuingOrganization)}</div></div>`)
          .join('')}`
      : ''
  }

  ${
    achievements.length
      ? `<h2>Achievements</h2>${achievements.map((a) => `<div class="entry"><div class="entry-title">${esc(a.title)}</div></div>`).join('')}`
      : ''
  }

  ${languages.length ? `<h2>Languages</h2><p class="skills-list">${languages.map((l) => esc(l.languageName)).join('  ·  ')}</p>` : ''}
</div></body></html>`
}

export const essentialTemplate: TemplateDefinition = {
  id: 'the-essential',
  name: 'The Essential',
  description: 'Stripped back to what matters most.',
  badge: 'Minimal',
  render,
}
