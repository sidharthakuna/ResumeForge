import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  const name = personalInfo?.fullName || 'Your Name'
  const jobTitle = personalInfo?.jobTitle || ''
  const email = personalInfo?.email || ''
  const phone = personalInfo?.phone || ''
  const location = personalInfo?.location || ''
  const linkedin = personalInfo?.linkedinUrl || ''
  const github = personalInfo?.githubUrl || ''
  const portfolio = personalInfo?.portfolioUrl || ''

  // Format link for clean display e.g. "https://github.com/sidharthakuna" -> "github.com/sidharthakuna"
  const cleanLink = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  // Strengths array from newline-separated text
  const strengthsList = (resume.strengths ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page {
    font-family: 'Liberation Sans', 'Inter', -apple-system, sans-serif;
    color: #111;
    line-height: 1.4;
    padding: 24px 32px;
  }
  .header { text-align: center; margin-bottom: 12px; }
  .header h1 {
    font-size: 22px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 4px 0;
    color: #111111;
  }
  .header .tagline {
    font-size: 12px;
    font-weight: 600;
    color: #222222;
    margin-bottom: 6px;
  }
  .header .contact-line {
    font-size: 10.5px;
    color: #333333;
    margin-top: 2px;
  }
  .header .contact-line span:not(:last-child)::after {
    content: '  •  ';
    color: #666666;
    font-weight: normal;
  }
  .header a {
    color: #111111;
    text-decoration: underline;
  }

  h2 {
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #111111;
    border-bottom: 1.2px solid #222222;
    padding-bottom: 2px;
    margin: 14px 0 6px 0;
  }

  p.text-body {
    font-size: 10.5px;
    color: #222;
    margin: 0 0 6px 0;
    text-align: justify;
    line-height: 1.45;
  }

  .entry { margin-bottom: 8px; }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .entry-title {
    font-size: 11px;
    font-weight: 700;
    color: #000;
  }
  .entry-date {
    font-size: 10.5px;
    font-style: italic;
    color: #444;
  }
  .entry-sub {
    font-size: 10.5px;
    font-style: italic;
    color: #444;
    margin-top: 1px;
  }

  ul.bullets {
    margin: 3px 0 6px 18px;
    padding: 0;
    list-style-type: disc;
  }
  ul.bullets li {
    font-size: 10.5px;
    color: #222;
    margin-bottom: 2px;
    line-height: 1.4;
  }

  .skills-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2px;
  }
  .skills-table td {
    vertical-align: top;
    padding: 2px 0;
    font-size: 10.5px;
  }
  .skills-table td.label {
    font-weight: 700;
    width: 28%;
    color: #000;
  }
  .skills-table td.val {
    color: #222;
  }

  .declaration-block {
    margin-top: 6px;
  }
  .signature-name {
    margin-top: 24px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
  }
</style></head>
<body><div class="page">

  <!-- HEADER -->
  <div class="header">
    <h1>${esc(name)}</h1>
    ${jobTitle ? `<div class="tagline">${esc(jobTitle)}</div>` : ''}
    <div class="contact-line">
      ${location ? `<span>${esc(location)}</span>` : ''}
      ${email ? `<span>${esc(email)}</span>` : ''}
      ${phone ? `<span>${esc(phone)}</span>` : ''}
    </div>
    ${
      github || portfolio || linkedin
        ? `<div class="contact-line">
            ${github ? `<span>GitHub: <a href="${esc(github)}">${esc(cleanLink(github))}</a></span>` : ''}
            ${portfolio ? `<span>Portfolio: <a href="${esc(portfolio)}">${esc(cleanLink(portfolio))}</a></span>` : ''}
            ${linkedin ? `<span>LinkedIn: <a href="${esc(linkedin)}">${esc(cleanLink(linkedin))}</a></span>` : ''}
          </div>`
        : ''
    }
  </div>

  <!-- PROFESSIONAL SUMMARY -->
  ${resume.summary ? `<h2>PROFESSIONAL SUMMARY</h2><p class="text-body">${esc(resume.summary)}</p>` : ''}

  <!-- EDUCATION -->
  ${
    education.length
      ? `<h2>EDUCATION</h2>${education
          .map(
            (ed) => `<div class="entry">
        <div class="entry-header">
          <span class="entry-title">${esc(ed.degree)}</span>
          <span class="entry-date">${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</span>
        </div>
        <div class="entry-sub">${esc(ed.institution)}${ed.fieldOfStudy ? ` • ${esc(ed.fieldOfStudy)}` : ''}${(ed as any).grade ? ` • ${esc((ed as any).grade)}` : ''}</div>
      </div>`,
          )
          .join('')}`
      : ''
  }

  <!-- TECHNICAL SKILLS -->
  ${
    skills.length
      ? `<h2>TECHNICAL SKILLS</h2>
         <table class="skills-table">
           ${skills
             .map((s) => {
               const parts = s.name.split(':')
               if (parts.length > 1) {
                 return `<tr><td class="label">${esc(parts[0].trim())}</td><td class="val">${esc(parts.slice(1).join(':').trim())}</td></tr>`
               }
               return `<tr><td class="label">Skills</td><td class="val">${esc(s.name)}</td></tr>`
             })
             .join('')}
         </table>`
      : ''
  }

  <!-- EXPERIENCE -->
  ${
    experience.length
      ? `<h2>EXPERIENCE</h2>${experience
          .map(
            (e) => `<div class="entry">
        <div class="entry-header">
          <span class="entry-title">${esc(e.jobTitle)} | ${esc(e.company)}</span>
          <span class="entry-date">${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate)}</span>
        </div>
        ${
          e.description
            ? `<ul class="bullets">${e.description
                .split('\n')
                .filter(Boolean)
                .map((b) => `<li>${esc(b.replace(/^[•*-]\s*/, ''))}</li>`)
                .join('')}</ul>`
            : ''
        }
      </div>`,
          )
          .join('')}`
      : ''
  }

  <!-- PROJECTS -->
  ${
    projects.length
      ? `<h2>PROJECTS</h2>${projects
          .map(
            (p, idx) => `<div class="entry">
        <div class="entry-title">${idx + 1}. ${esc(p.title)}</div>
        ${
          p.description
            ? `<ul class="bullets">${p.description
                .split('\n')
                .filter(Boolean)
                .map((b) => `<li>${esc(b.replace(/^[•*-]\s*/, ''))}</li>`)
                .join('')}</ul>`
            : ''
        }
      </div>`,
          )
          .join('')}`
      : ''
  }

  <!-- CERTIFICATIONS -->
  ${
    certifications.length
      ? `<h2>CERTIFICATIONS</h2>
         <ul class="bullets">
           ${certifications
             .map((c) => `<li><strong>${esc(c.name)}</strong> — ${esc(c.issuingOrganization)}${c.issueDate ? ` (${fmtDate(c.issueDate)})` : ''}</li>`)
             .join('')}
         </ul>`
      : ''
  }

  <!-- ACHIEVEMENTS -->
  ${
    achievements.length
      ? `<h2>ACHIEVEMENTS</h2>
         <ul class="bullets">
           ${achievements
             .map((a) => `<li><strong>${esc(a.title)}</strong>${a.description ? `: ${esc(a.description)}` : ''}</li>`)
             .join('')}
         </ul>`
      : ''
  }

  <!-- STRENGTHS -->
  ${
    strengthsList.length
      ? `<h2>STRENGTHS</h2>
         <ul class="bullets">
           ${strengthsList.map((st) => `<li>${esc(st.replace(/^[•*-]\s*/, ''))}</li>`).join('')}
         </ul>`
      : ''
  }

  <!-- LANGUAGES -->
  ${
    languages.length
      ? `<h2>LANGUAGES</h2>
         <ul class="bullets">
           ${languages.map((l) => `<li>${esc(l.languageName)}</li>`).join('')}
         </ul>`
      : ''
  }

  <!-- DECLARATION -->
  ${
    resume.declaration
      ? `<h2>DECLARATION</h2>
         <div class="declaration-block">
           <p class="text-body">${esc(resume.declaration)}</p>
           <div class="signature-name">${esc(name)}</div>
         </div>`
      : ''
  }

</div></body></html>`
}

export const sidharthaClassicTemplate: TemplateDefinition = {
  id: 'sidhartha-classic',
  name: 'Classic Professional',
  description: 'Clean ATS-friendly serif & line dividers layout matching academic and engineering standards.',
  badge: 'Featured ATS',
  render,
}

