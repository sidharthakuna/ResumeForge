import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  const name = esc(personalInfo?.fullName) || 'Alex Rivera'
  const jobTitle = esc(personalInfo?.jobTitle) || (resume.title && resume.title !== 'Untitled resume' ? esc(resume.title) : 'Software Engineer')

  // Parse strengths into array
  const strengthsList = (resume.strengths || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  // Group skills by category if format is "Category: Skill1, Skill2"
  const skillGroups: { category: string; values: string }[] = []
  const ungroupedSkills: string[] = []

  skills.forEach((s) => {
    if (s.name.includes(':')) {
      const [cat, ...rest] = s.name.split(':')
      skillGroups.push({ category: cat.trim(), values: rest.join(':').trim() })
    } else {
      ungroupedSkills.push(s.name)
    }
  })

  if (ungroupedSkills.length > 0) {
    skillGroups.push({ category: 'Technical Skills', values: ungroupedSkills.join(', ') })
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${name} — Resume</title>
<style>
  ${baseDocumentStyles}
  :root {
    --ink: #0d0f14;
    --ink-soft: #262a33;
    --ink-faint: #52586a;
    --rule: #cdd2db;
    --paper: #ffffff;
  }

  .page {
    font-family: 'Georgia', 'Iowan Old Style', 'Palatino Linotype', serif;
    color: var(--ink);
    background: var(--paper);
    padding: 0;
    min-height: 297mm;
    line-height: 1.4;
  }

  /* ---------- HEADER ---------- */
  .header {
    padding: 22px 30px 16px;
    border-bottom: 1.5px solid var(--ink);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px 18px;
  }

  .header .identity {
    flex: 1 1 auto;
    min-width: 260px;
  }

  .header h1 {
    margin: 0 0 2px;
    font-size: 24px;
    letter-spacing: 0.2px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.1;
    font-family: 'Georgia', serif;
  }

  .header .role {
    margin: 0;
    font-size: 11px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--ink-soft);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 700;
  }

  .contact-row {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9.5px;
    color: var(--ink-soft);
    text-align: right;
    line-height: 1.3;
  }

  .contact-row .contact-line {
    white-space: nowrap;
  }

  .contact-row a { color: var(--ink-soft); text-decoration: none; border-bottom: 1px solid var(--rule); }
  .contact-row a:hover { color: var(--ink); border-color: var(--ink); }

  /* ---------- TWO EQUAL COLUMNS ---------- */
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 12px;
  }

  .col {
    padding: 12px 26px 8px;
  }

  .col-left {
    padding-right: 14px;
  }

  .col-right {
    padding-left: 14px;
  }

  /* ---------- SECTION STYLES ---------- */
  section { margin-bottom: 9px; }
  section:last-child { margin-bottom: 0; }

  .section-title {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 10px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--ink);
    margin: 0 0 7px;
    padding-bottom: 3px;
    border-bottom: 1.25px solid var(--ink);
  }

  .summary-text {
    font-size: 10px;
    line-height: 1.45;
    color: var(--ink-soft);
    margin: 0;
    text-align: justify;
  }

  /* Experience / Projects entries */
  .entry { margin-bottom: 9px; }
  .entry:last-child { margin-bottom: 0; }

  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 1px;
  }

  .entry-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--ink);
  }

  .entry-date {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 8.5px;
    color: var(--ink-faint);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .entry-sub {
    font-size: 10px;
    font-style: italic;
    color: var(--ink-soft);
    margin-bottom: 3px;
  }

  .entry ul {
    margin: 3px 0 0;
    padding-left: 14px;
  }

  .entry li {
    font-size: 9.5px;
    line-height: 1.38;
    color: var(--ink-soft);
    margin-bottom: 2px;
  }

  /* Education */
  .edu-entry { margin-bottom: 7px; }
  .edu-entry:last-child { margin-bottom: 0; }
  .edu-degree { font-size: 10.5px; font-weight: 700; color: var(--ink); }
  .edu-meta { font-size: 9.5px; color: var(--ink-soft); margin-top: 1px; line-height: 1.35; }
  .edu-date {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 8.5px;
    color: var(--ink-faint);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-top: 1px;
  }

  /* Skills */
  .skill-row { margin-bottom: 5px; }
  .skill-row:last-child { margin-bottom: 0; }
  .skill-label {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 9px;
    font-weight: 700;
    color: var(--ink);
    text-transform: uppercase;
    letter-spacing: 0.2px;
    margin-bottom: 1px;
  }
  .skill-values {
    font-size: 9.5px;
    color: var(--ink-soft);
    line-height: 1.32;
  }

  /* Lists */
  .plain-list {
    margin: 0;
    padding-left: 14px;
  }
  .plain-list li {
    font-size: 9.5px;
    line-height: 1.34;
    color: var(--ink-soft);
    margin-bottom: 3px;
  }
  .plain-list li:last-child { margin-bottom: 0; }
  .plain-list b { color: var(--ink); }

  .cert-entry { margin-bottom: 5px; }
  .cert-entry:last-child { margin-bottom: 0; }
  .cert-name { font-size: 9.5px; font-weight: 700; color: var(--ink); }
  .cert-meta {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 8.5px;
    color: var(--ink-faint);
    margin-top: 0px;
  }

  .langs {
    font-size: 9.5px;
    color: var(--ink-soft);
    margin: 0;
    line-height: 1.35;
  }

  /* ---------- DECLARATION ---------- */
  .declaration-block {
    padding: 8px 26px 12px;
    border-top: 1px solid var(--rule);
    max-width: 50%;
  }

  .declaration-block .section-title {
    margin: 0 0 4px;
  }

  .declaration {
    font-size: 8.5px;
    color: var(--ink-faint);
    font-style: italic;
    line-height: 1.35;
    margin: 0;
  }
</style>
</head>
<body>

<div class="page">

  <!-- ============ HEADER ============ -->
  <div class="header">
    <div class="identity">
      <h1>${name}</h1>
      <p class="role">${jobTitle}</p>
    </div>
    <div class="contact-row">
      ${personalInfo?.location ? `<div class="contact-line">📍 ${esc(personalInfo.location)}</div>` : ''}
      <div class="contact-line">
        ${personalInfo?.email ? `<a href="mailto:${esc(personalInfo.email)}">${esc(personalInfo.email)}</a>` : ''}
        ${personalInfo?.email && personalInfo?.phone ? ' &nbsp;|&nbsp; ' : ''}
        ${personalInfo?.phone ? `<span>${esc(personalInfo.phone)}</span>` : ''}
      </div>
      ${personalInfo?.githubUrl ? `<div class="contact-line"><a href="${esc(personalInfo.githubUrl)}" target="_blank" rel="noopener">${esc(personalInfo.githubUrl.replace(/^https?:\/\//, ''))}</a></div>` : ''}
      <div class="contact-line">
        ${personalInfo?.portfolioUrl ? `<a href="${esc(personalInfo.portfolioUrl)}" target="_blank" rel="noopener">${esc(personalInfo.portfolioUrl.replace(/^https?:\/\//, ''))}</a>` : ''}
        ${personalInfo?.portfolioUrl && personalInfo?.linkedinUrl ? ' &nbsp;|&nbsp; ' : ''}
        ${personalInfo?.linkedinUrl ? `<a href="${esc(personalInfo.linkedinUrl)}" target="_blank" rel="noopener">${esc(personalInfo.linkedinUrl.replace(/^https?:\/\//, ''))}</a>` : ''}
      </div>
    </div>
  </div>

  <!-- ============ TWO EQUAL COLUMNS ============ -->
  <div class="columns">

    <!-- ---------- LEFT COLUMN ---------- -->
    <div class="col col-left">

      ${
        resume.summary
          ? `<section>
              <h2 class="section-title">Professional Summary</h2>
              <p class="summary-text">${esc(resume.summary)}</p>
            </section>`
          : ''
      }

      ${
        experience.length
          ? `<section>
              <h2 class="section-title">Experience</h2>
              ${experience
                .map((e) => {
                  const bullets = (e.description || '')
                    .split('\n')
                    .map((b) => b.trim())
                    .filter(Boolean)
                    .map((b) => `<li>${esc(b.replace(/^[•*-]\s*/, ''))}</li>`)
                    .join('')

                  return `
                  <div class="entry">
                    <div class="entry-head">
                      <span class="entry-title">${esc(e.jobTitle)}</span>
                      <span class="entry-date">${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate) || 'Present'}</span>
                    </div>
                    <div class="entry-sub">${esc(e.company)}</div>
                    ${bullets ? `<ul>${bullets}</ul>` : ''}
                  </div>`
                })
                .join('')}
            </section>`
          : ''
      }

      ${
        projects.length
          ? `<section>
              <h2 class="section-title">Projects</h2>
              ${projects
                .map((p) => {
                  const bullets = (p.description || '')
                    .split('\n')
                    .map((b) => b.trim())
                    .filter(Boolean)
                    .map((b) => `<li>${esc(b.replace(/^[•*-]\s*/, ''))}</li>`)
                    .join('')

                  const dates = p.startDate || p.endDate
                    ? `<span class="entry-date">${fmtDate(p.startDate)} – ${p.currentlyBuilding ? 'Present' : fmtDate(p.endDate) || 'Present'}</span>`
                    : ''

                  return `
                  <div class="entry">
                    <div class="entry-head">
                      <span class="entry-title">${esc(p.title)}</span>
                      ${dates}
                    </div>
                    ${bullets ? `<ul>${bullets}</ul>` : ''}
                  </div>`
                })
                .join('')}
            </section>`
          : ''
      }

    </div>

    <!-- ---------- RIGHT COLUMN ---------- -->
    <div class="col col-right">

      ${
        education.length
          ? `<section>
              <h2 class="section-title">Education</h2>
              ${education
                .map(
                  (ed) => `
                <div class="edu-entry">
                  <div class="edu-degree">${esc(ed.degree)}</div>
                  <div class="edu-meta">${esc(ed.institution)}</div>
                  ${ed.fieldOfStudy || ed.grade ? `<div class="edu-meta">${ed.fieldOfStudy ? esc(ed.fieldOfStudy) : ''}${ed.fieldOfStudy && ed.grade ? ', ' : ''}${ed.grade ? `CGPA: ${esc(ed.grade)}` : ''}</div>` : ''}
                  ${ed.startDate || ed.endDate ? `<div class="edu-date">${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</div>` : ''}
                </div>`,
                )
                .join('')}
            </section>`
          : ''
      }

      ${
        skillGroups.length
          ? `<section>
              <h2 class="section-title">Technical Skills</h2>
              ${skillGroups
                .map(
                  (g) => `
                <div class="skill-row">
                  <div class="skill-label">${esc(g.category)}</div>
                  <div class="skill-values">${esc(g.values)}</div>
                </div>`,
                )
                .join('')}
            </section>`
          : ''
      }

      ${
        certifications.length
          ? `<section>
              <h2 class="section-title">Certifications</h2>
              ${certifications
                .map(
                  (c) => `
                <div class="cert-entry">
                  <div class="cert-name">${esc(c.name)}</div>
                  <div class="cert-meta">${esc(c.issuingOrganization)}${c.issueDate ? ` · ${fmtDate(c.issueDate)}` : ''}</div>
                </div>`,
                )
                .join('')}
            </section>`
          : ''
      }

      ${
        achievements.length
          ? `<section>
              <h2 class="section-title">Achievements</h2>
              <ul class="plain-list">
                ${achievements
                  .map((a) => `<li><b>${esc(a.title)}:</b> ${esc(a.description || a.issuer || '')}</li>`)
                  .join('')}
              </ul>
            </section>`
          : ''
      }

      ${
        strengthsList.length
          ? `<section>
              <h2 class="section-title">Strengths</h2>
              <ul class="plain-list">
                ${strengthsList.map((st) => `<li>${esc(st.replace(/^[•*-]\s*/, ''))}</li>`).join('')}
              </ul>
            </section>`
          : ''
      }

      ${
        languages.length
          ? `<section>
              <h2 class="section-title">Languages</h2>
              <p class="langs">${languages.map((l) => `${esc(l.languageName)}${l.proficiencyLevel ? ` (${l.proficiencyLevel.toLowerCase()})` : ''}`).join(', ')}</p>
            </section>`
          : ''
      }

    </div>

  </div>

  <!-- ============ DECLARATION ============ -->
  ${
    resume.declaration
      ? `<div class="declaration-block">
          <h2 class="section-title">Declaration</h2>
          <p class="declaration">
            ${esc(resume.declaration)}
            <br/>— ${name}
          </p>
        </div>`
      : ''
  }

</div>

</body>
</html>`
}

export const editorialColumnsTemplate: TemplateDefinition = {
  id: 'editorial-columns',
  name: 'Editorial Columns',
  description: 'Balanced two-column layout with serif typography, right-aligned contact header, and clean categorized technical skills.',
  badge: 'Two Column',
  render,
}
