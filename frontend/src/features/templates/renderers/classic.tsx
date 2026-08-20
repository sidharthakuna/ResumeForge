import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page { font-family: 'Inter', -apple-system, sans-serif; }
  h1 { font-family: 'Hanken Grotesk', sans-serif; font-size: 26px; font-weight: 700; margin: 0 0 2px; letter-spacing: -0.2px; color: #191c1d; }
  .contact { font-size: 12px; color: #464555; margin-bottom: 18px; }
  .contact span:not(:last-child)::after { content: ' · '; color: #c7c4d8; }
  h2 { font-family: 'Hanken Grotesk', sans-serif; font-size: 12.5px; text-transform: uppercase; letter-spacing: 1.5px; color: #191c1d; font-weight: 700; border-bottom: 1px solid #e1e3e4; padding-bottom: 4px; margin: 20px 0 10px; }
  .entry { margin-bottom: 12px; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 600; font-size: 14px; color: #191c1d; }
  .entry-sub { font-size: 12.5px; color: #3525cd; }
  .entry-date { font-size: 11.5px; color: #5c5b6d; white-space: nowrap; }
  .entry-desc { font-size: 12.5px; color: #33353f; margin-top: 3px; line-height: 1.5; }
  .summary { font-size: 13px; line-height: 1.6; color: #33353f; }
  .skills-row { font-size: 12.5px; color: #33353f; line-height: 1.7; }
  .tag { display: inline-block; }
  .tag:not(:last-child)::after { content: ' • '; color: #c7c4d8; }
</style></head>
<body><div class="page">
  <h1>${esc(personalInfo?.fullName) || 'Your Name'}</h1>
  <div class="contact">
    ${personalInfo?.email ? `<span>${esc(personalInfo.email)}</span>` : ''}
    ${personalInfo?.phone ? `<span>${esc(personalInfo.phone)}</span>` : ''}
    ${personalInfo?.location ? `<span>${esc(personalInfo.location)}</span>` : ''}
    ${personalInfo?.linkedinUrl ? `<span>${esc(personalInfo.linkedinUrl)}</span>` : ''}
    ${personalInfo?.portfolioUrl ? `<span>${esc(personalInfo.portfolioUrl)}</span>` : ''}
  </div>

  ${resume.summary ? `<h2>Summary</h2><p class="summary">${esc(resume.summary)}</p>` : ''}

  ${
    experience.length
      ? `<h2>Experience</h2>${experience
          .map(
            (e) => `<div class="entry">
        <div class="entry-head"><span class="entry-title">${esc(e.jobTitle)} — ${esc(e.company)}</span>
        <span class="entry-date">${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate)}</span></div>
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
        <div class="entry-head"><span class="entry-title">${esc(ed.degree)}</span>
        <span class="entry-date">${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</span></div>
        <div class="entry-sub">${esc(ed.institution)}${ed.fieldOfStudy ? ` · ${esc(ed.fieldOfStudy)}` : ''}</div>
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
        <div class="entry-head"><span class="entry-title">${esc(c.name)}</span><span class="entry-date">${fmtDate(c.issueDate)}</span></div>
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

  ${languages.length ? `<h2>Languages</h2><div class="skills-row">${languages.map((l) => `<span class="tag">${esc(l.languageName)} (${l.proficiencyLevel.toLowerCase()})</span>`).join('')}</div>` : ''}

  ${resume.declaration ? `<h2>Declaration</h2><p class="summary">${esc(resume.declaration)}</p>` : ''}
</div></body></html>`
}

export const standardTemplate: TemplateDefinition = {
  id: 'the-standard',
  name: 'The Standard',
  description: 'Classic, rigorous, gets past the bots.',
  badge: 'ATS Friendly',
  render,
}
