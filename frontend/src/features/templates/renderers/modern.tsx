import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page { padding: 0; font-family: 'Inter', -apple-system, sans-serif; }
  .header { background: #191c1d; color: #f8f9fa; padding: 16mm 20mm 12mm; }
  .header h1 { margin: 0; font-family: 'Hanken Grotesk', sans-serif; font-size: 28px; font-weight: 700; }
  .header .role { color: #8b85ee; font-size: 13px; margin-top: 3px; font-weight: 500; }
  .contact { margin-top: 10px; font-size: 11.5px; color: #c7c4d8; display: flex; flex-wrap: wrap; gap: 10px; }
  .body { padding: 10mm 20mm 16mm; }
  h2 { font-family: 'Hanken Grotesk', sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1.2px; color: #3525cd; margin: 18px 0 10px; font-weight: 700; }
  h2:first-child { margin-top: 0; }
  .entry { margin-bottom: 13px; padding-left: 12px; border-left: 2px solid #f3f4f5; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 600; font-size: 13.5px; color: #191c1d; }
  .entry-sub { font-size: 12px; color: #5c5b6d; }
  .entry-date { font-size: 11px; color: #9997a8; white-space: nowrap; }
  .entry-desc { font-size: 12px; color: #33353f; margin-top: 3px; line-height: 1.55; }
  .summary { font-size: 12.5px; line-height: 1.6; color: #33353f; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { background: #e2dfff; color: #2b2098; font-size: 11px; padding: 3px 9px; border-radius: 999px; font-weight: 500; }
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
    </div>
  </div>
  <div class="body">
    ${resume.summary ? `<h2>Summary</h2><p class="summary">${esc(resume.summary)}</p>` : ''}

    ${
      experience.length
        ? `<h2>Experience</h2>${experience
            .map(
              (e) => `<div class="entry">
          <div class="entry-head"><span class="entry-title">${esc(e.jobTitle)}</span><span class="entry-date">${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate)}</span></div>
          <div class="entry-sub">${esc(e.company)}</div>
          ${e.description ? `<div class="entry-desc">${esc(e.description)}</div>` : ''}
        </div>`,
            )
            .join('')}`
        : ''
    }

    ${
      projects.length
        ? `<h2>Projects</h2>${projects
            .map(
              (p) => `<div class="entry"><div class="entry-title">${esc(p.title)}</div>${p.description ? `<div class="entry-desc">${esc(p.description)}</div>` : ''}</div>`,
            )
            .join('')}`
        : ''
    }

    ${
      education.length
        ? `<h2>Education</h2>${education
            .map(
              (ed) => `<div class="entry">
          <div class="entry-head"><span class="entry-title">${esc(ed.degree)}</span><span class="entry-date">${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</span></div>
          <div class="entry-sub">${esc(ed.institution)}${ed.fieldOfStudy ? ` · ${esc(ed.fieldOfStudy)}` : ''}</div>
        </div>`,
            )
            .join('')}`
        : ''
    }

    ${skills.length ? `<h2>Skills</h2><div class="chip-row">${skills.map((s) => `<span class="chip">${esc(s.name)}</span>`).join('')}</div>` : ''}

    ${
      certifications.length
        ? `<h2>Certifications</h2>${certifications
            .map(
              (c) => `<div class="entry"><div class="entry-head"><span class="entry-title">${esc(c.name)}</span><span class="entry-date">${fmtDate(c.issueDate)}</span></div><div class="entry-sub">${esc(c.issuingOrganization)}</div></div>`,
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

    ${languages.length ? `<h2>Languages</h2><div class="chip-row">${languages.map((l) => `<span class="chip">${esc(l.languageName)}</span>`).join('')}</div>` : ''}
  </div>
</div></body></html>`
}

export const directorTemplate: TemplateDefinition = {
  id: 'the-director',
  name: 'The Director',
  description: 'Authoritative design for leadership roles.',
  badge: 'Executive',
  render,
}
