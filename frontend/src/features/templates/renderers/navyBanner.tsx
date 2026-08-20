import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page { padding: 0; font-family: 'Inter', -apple-system, sans-serif; background: #ffffff; }
  .header-banner { background-color: #061342; padding: 28px 24px 22px; text-align: center; color: #ffffff; }
  .header-banner h1 { font-family: Georgia, serif; font-size: 26px; text-transform: uppercase; letter-spacing: 3px; font-weight: 700; margin: 0; color: #ffffff; }
  .header-banner p { font-style: italic; font-size: 13px; letter-spacing: 1.5px; margin: 6px 0 0; color: #d8e2ff; }
  
  .content-wrapper { display: flex; width: 100%; min-height: 250mm; }
  .left-col { width: 32%; background-color: #f7f9fc; padding: 22px 18px; border-right: 1px solid #e5e9f0; box-sizing: border-box; }
  .right-col { width: 68%; padding: 22px 24px; box-sizing: border-box; }

  .col-title { font-family: Georgia, serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #061342; margin: 0 0 10px; border-bottom: 1px solid #d0d7de; padding-bottom: 3px; }
  .left-col .col-title { margin-top: 18px; }
  .left-col .col-title:first-of-type { margin-top: 0; }
  .right-col .col-title { margin-top: 22px; }
  .right-col .col-title:first-of-type { margin-top: 0; }

  .contact-item { font-size: 11px; color: #333333; margin-bottom: 7px; word-break: break-word; }
  .contact-label { font-weight: 600; color: #061342; }

  .edu-item { margin-bottom: 12px; }
  .edu-degree { font-weight: 700; font-size: 12px; color: #061342; }
  .edu-school { font-size: 11px; color: #444444; }
  .edu-date { font-size: 10.5px; color: #666666; }

  .skill-item { font-size: 11.5px; color: #333333; margin-bottom: 5px; }

  .entry { margin-bottom: 15px; }
  .entry-title { font-weight: 700; font-size: 13.5px; color: #111111; }
  .entry-company { font-size: 12px; font-weight: 500; color: #061342; }
  .entry-meta { font-size: 11px; color: #666666; margin: 1px 0 4px; }
  .entry-desc { font-size: 12px; color: #333333; line-height: 1.5; }

  .summary { font-size: 12.5px; line-height: 1.6; color: #222222; }
</style></head>
<body><div class="page">
  <div class="header-banner">
    <h1>${esc(personalInfo?.fullName) || 'Your Name'}</h1>
    <p>${esc(resume.title) || 'Professional Resume'}</p>
  </div>

  <div class="content-wrapper">
    <div class="left-col">
      <div class="col-title">Contact</div>
      ${personalInfo?.email ? `<div class="contact-item"><span class="contact-label">Email:</span><br/>${esc(personalInfo.email)}</div>` : ''}
      ${personalInfo?.phone ? `<div class="contact-item"><span class="contact-label">Phone:</span><br/>${esc(personalInfo.phone)}</div>` : ''}
      ${personalInfo?.location ? `<div class="contact-item"><span class="contact-label">Location:</span><br/>${esc(personalInfo.location)}</div>` : ''}
      ${personalInfo?.linkedinUrl ? `<div class="contact-item"><span class="contact-label">LinkedIn:</span><br/>${esc(personalInfo.linkedinUrl)}</div>` : ''}
      ${personalInfo?.portfolioUrl ? `<div class="contact-item"><span class="contact-label">Portfolio:</span><br/>${esc(personalInfo.portfolioUrl)}</div>` : ''}

      ${
        education.length
          ? `<div class="col-title">Education</div>${education
              .map(
                (ed) => `<div class="edu-item">
            <div class="edu-degree">${esc(ed.degree)}</div>
            <div class="edu-school">${esc(ed.institution)}</div>
            <div class="edu-date">${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</div>
            ${(ed as any).grade ? `<div class="edu-date">GPA: ${esc((ed as any).grade)}</div>` : ''}
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        skills.length
          ? `<div class="col-title">Skills</div>${skills
              .map((s) => `<div class="skill-item">• ${esc(s.name)}</div>`)
              .join('')}`
          : ''
      }

      ${
        languages.length
          ? `<div class="col-title">Languages</div>${languages
              .map((l) => `<div class="skill-item">• ${esc(l.languageName)}</div>`)
              .join('')}`
          : ''
      }
    </div>

    <div class="right-col">
      ${resume.summary ? `<div class="col-title">Career Objective</div><p class="summary">${esc(resume.summary)}</p>` : ''}

      ${
        experience.length
          ? `<div class="col-title">Work Experience</div>${experience
              .map(
                (e) => `<div class="entry">
            <div class="entry-title">${esc(e.jobTitle)}</div>
            <div class="entry-company">${esc(e.company)}</div>
            <div class="entry-meta">${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate)}${(e as any).location ? ` / ${esc((e as any).location)}` : ''}</div>
            ${e.description ? `<div class="entry-desc">${esc(e.description)}</div>` : ''}
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        projects.length
          ? `<div class="col-title">Projects</div>${projects
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
        certifications.length
          ? `<div class="col-title">Certifications</div>${certifications
              .map(
                (c) => `<div class="entry">
            <div class="entry-title">${esc(c.name)}</div>
            <div class="entry-company">${esc(c.issuingOrganization)} — ${fmtDate(c.issueDate)}</div>
          </div>`,
              )
              .join('')}`
          : ''
      }

      ${
        achievements.length
          ? `<div class="col-title">Achievements</div>${achievements
              .map((a) => `<div class="entry"><div class="entry-title">${esc(a.title)}</div>${a.description ? `<div class="entry-desc">${esc(a.description)}</div>` : ''}</div>`)
              .join('')}`
          : ''
      }

      ${resume.declaration ? `<div class="col-title">Declaration</div><p class="summary">${esc(resume.declaration)}</p>` : ''}
    </div>
  </div>
</div></body></html>`
}

export const navyBannerTemplate: TemplateDefinition = {
  id: 'navy-banner',
  name: 'Navy Banner',
  description: 'Striking deep navy blue header block with a structured two-column layout. Popular for web developers & modern professionals.',
  badge: 'Creative',
  render,
}
