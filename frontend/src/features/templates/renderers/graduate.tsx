import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page { font-family: 'Inter', -apple-system, sans-serif; padding: 18mm 20mm; }
  .header { border-bottom: 3px solid #3525cd; padding-bottom: 10px; margin-bottom: 16px; }
  h1 { font-family: 'Hanken Grotesk', sans-serif; font-size: 25px; font-weight: 700; margin: 0 0 3px; color: #191c1d; }
  .role { font-size: 12.5px; color: #3525cd; font-weight: 600; margin-bottom: 6px; }
  .contact { font-size: 11.5px; color: #464555; }
  .contact span:not(:last-child)::after { content: ' · '; color: #c7c4d8; }
  h2 { font-family: 'Hanken Grotesk', sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1.3px; color: #3525cd; font-weight: 700; margin: 18px 0 9px; display: flex; align-items: center; gap: 6px; }
  h2:first-of-type { margin-top: 0; }
  .entry { margin-bottom: 12px; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 700; font-size: 13.5px; color: #191c1d; }
  .entry-sub { font-size: 12px; color: #33353f; }
  .entry-date { font-size: 11px; color: #5c5b6d; white-space: nowrap; }
  .entry-desc { font-size: 12px; color: #33353f; margin-top: 3px; line-height: 1.55; }
  .summary { font-size: 12.5px; line-height: 1.6; color: #33353f; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { background: #f3f4f5; color: #33353f; font-size: 11px; padding: 3px 9px; border-radius: 6px; font-weight: 500; border: 1px solid #e1e3e4; }
  .edu-degree-badge { background: #e2dfff; color: #2b2098; font-size: 10px; padding: 2px 8px; border-radius: 999px; font-weight: 600; }
</style></head>
<body><div class="page">
  <div class="header">
    <h1>${esc(personalInfo?.fullName) || 'Your Name'}</h1>
    ${resume.title ? `<div class="role">${esc(resume.title)}</div>` : ''}
    <div class="contact">
      ${personalInfo?.email ? `<span>${esc(personalInfo.email)}</span>` : ''}
      ${personalInfo?.phone ? `<span>${esc(personalInfo.phone)}</span>` : ''}
      ${personalInfo?.location ? `<span>${esc(personalInfo.location)}</span>` : ''}
      ${personalInfo?.linkedinUrl ? `<span>${esc(personalInfo.linkedinUrl)}</span>` : ''}
      ${personalInfo?.portfolioUrl ? `<span>${esc(personalInfo.portfolioUrl)}</span>` : ''}
    </div>
  </div>

  ${resume.summary ? `<h2>Objective</h2><p class="summary">${esc(resume.summary)}</p>` : ''}

  ${
    education.length
      ? `<h2>Education</h2>${education
          .map(
            (ed) => `<div class="entry">
        <div class="entry-head">
          <span class="entry-title">${esc(ed.institution)}</span>
          <span class="entry-date">${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</span>
        </div>
        <div class="entry-sub"><span class="edu-degree-badge">${esc(ed.degree)}</span>${ed.fieldOfStudy ? ` &nbsp;${esc(ed.fieldOfStudy)}` : ''}</div>
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
        ${[p.githubUrl, p.demoUrl].filter(Boolean).length ? `<div class="entry-sub" style="margin-top:2px;">${[p.githubUrl, p.demoUrl].filter(Boolean).map((v) => esc(v as string)).join('  ·  ')}</div>` : ''}
      </div>`,
          )
          .join('')}`
      : ''
  }

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

  ${skills.length ? `<h2>Skills</h2><div class="chip-row">${skills.map((s) => `<span class="chip">${esc(s.name)}</span>`).join('')}</div>` : ''}

  ${
    achievements.length
      ? `<h2>Achievements &amp; Activities</h2>${achievements
          .map((a) => `<div class="entry"><div class="entry-head"><span class="entry-title">${esc(a.title)}</span>${a.achievementDate ? `<span class="entry-date">${fmtDate(a.achievementDate)}</span>` : ''}</div>${a.description ? `<div class="entry-desc">${esc(a.description)}</div>` : ''}</div>`)
          .join('')}`
      : ''
  }

  ${
    certifications.length
      ? `<h2>Certifications</h2>${certifications
          .map(
            (c) => `<div class="entry"><div class="entry-head"><span class="entry-title">${esc(c.name)}</span><span class="entry-date">${fmtDate(c.issueDate)}</span></div><div class="entry-sub">${esc(c.issuingOrganization)}</div></div>`,
          )
          .join('')}`
      : ''
  }

  ${languages.length ? `<h2>Languages</h2><div class="chip-row">${languages.map((l) => `<span class="chip">${esc(l.languageName)}</span>`).join('')}</div>` : ''}
</div></body></html>`
}

export const graduateTemplate: TemplateDefinition = {
  id: 'the-graduate',
  name: 'The Graduate',
  description: 'Highlight potential and academic projects.',
  badge: 'Student',
  render,
}
