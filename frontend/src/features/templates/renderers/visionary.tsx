import type { FullResumeResponse } from '@/types/api'
import { baseDocumentStyles, fmtDate, esc, type TemplateDefinition } from './types'

function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface SkillGroup {
  category: string
  items: string
}

function render(full: FullResumeResponse): string {
  const { personalInfo, resume, education, experience, projects, skills, certifications, achievements, languages } =
    full

  const name = esc(personalInfo?.fullName) || 'Alex Rivera'
  const jobTitle = esc(personalInfo?.jobTitle || resume.title || '')

  // Parse skill groups cleanly into category + text list (NO BUBBLES)
  const skillGroups: SkillGroup[] = []
  const looseSkills: string[] = []

  skills.forEach((s) => {
    if (s.name.includes(':')) {
      const [cat, ...rest] = s.name.split(':')
      skillGroups.push({ category: cat.trim(), items: rest.join(':').trim() })
    } else {
      looseSkills.push(s.name)
    }
  })

  if (looseSkills.length > 0) {
    skillGroups.push({ category: 'Technical Skills', items: looseSkills.join(', ') })
  }

  return `<html xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="utf-8" />
<style>
  ${baseDocumentStyles}
  .page { display: flex; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background: #ffffff; }
  
  /* ---------- SIDEBAR ---------- */
  .sidebar { width: 68mm; background: #0c1a3a; color: #eefeff; padding: 16mm 10mm; flex-shrink: 0; box-sizing: border-box; }
  .avatar { width: 22mm; height: 22mm; border-radius: 999px; background: #009da4; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Hanken Grotesk', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 5mm; overflow: hidden; border: 2px solid #5ff4fc; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sidebar h1 { font-family: 'Hanken Grotesk', sans-serif; font-size: 19px; font-weight: 700; margin: 0 0 2px; line-height: 1.15; color: #ffffff; }
  .sidebar .role { color: #5ff4fc; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8mm; }
  
  .side-h2 { font-size: 10.5px; text-transform: uppercase; letter-spacing: 1.4px; color: #5ff4fc; font-weight: 700; margin: 7mm 0 3mm; border-bottom: 1px solid rgba(95,244,252,0.25); padding-bottom: 2px; }
  .side-h2:first-of-type { margin-top: 0; }
  
  .contact-line { font-size: 10px; color: #d7fbfd; margin-bottom: 2.5mm; word-break: break-word; line-height: 1.4; }
  .contact-line a { color: #d7fbfd; text-decoration: none; }
  
  /* Skills - Clean Text Typography (No Bubbles) */
  .skill-group-item { margin-bottom: 3.5mm; }
  .skill-group-cat { font-size: 10px; font-weight: 700; color: #5ff4fc; margin-bottom: 1.5px; }
  .skill-group-text { font-size: 9.5px; color: #e2f9fa; line-height: 1.45; }

  .side-lang { font-size: 10px; color: #d7fbfd; margin-bottom: 2mm; display: flex; justify-content: space-between; gap: 6px; }
  
  /* ---------- MAIN CONTENT ---------- */
  .main { flex: 1; padding: 16mm 14mm; min-width: 0; box-sizing: border-box; }
  h2 { font-family: 'Hanken Grotesk', sans-serif; font-size: 12.5px; text-transform: uppercase; letter-spacing: 1.3px; color: #009da4; font-weight: 700; margin: 18px 0 10px; border-bottom: 1px solid #e1e8ed; padding-bottom: 3px; }
  h2:first-child { margin-top: 0; }
  
  .entry { margin-bottom: 14px; }
  .entry-head { display: flex; justify-content: space-between; align-items: baseline; }
  .entry-title { font-weight: 700; font-size: 13px; color: #191c1d; }
  .entry-sub { font-size: 12px; color: #008187; font-weight: 600; margin-top: 1px; }
  .entry-date { font-size: 11px; color: #787687; white-space: nowrap; }
  .entry-desc { font-size: 11.5px; color: #33353f; margin-top: 4px; line-height: 1.5; }
  .entry-desc ul { margin: 3px 0 0; padding-left: 16px; }
  .entry-desc li { margin-bottom: 2px; }
  
  .summary { font-size: 12px; line-height: 1.6; color: #33353f; }
</style></head>
<body><div class="page">
  
  <!-- ==================== SIDEBAR ==================== -->
  <aside class="sidebar">
    <div class="avatar">
      ${
        personalInfo?.photoUrl
          ? `<img src="${personalInfo.photoUrl}" alt="Profile avatar" />`
          : esc(initials(personalInfo?.fullName))
      }
    </div>
    <h1>${name}</h1>
    ${jobTitle ? `<div class="role">${jobTitle}</div>` : '<div class="role">&nbsp;</div>'}

    <div class="side-h2">Contact</div>
    ${personalInfo?.email ? `<div class="contact-line">Email: ${esc(personalInfo.email)}</div>` : ''}
    ${personalInfo?.phone ? `<div class="contact-line">Phone: ${esc(personalInfo.phone)}</div>` : ''}
    ${personalInfo?.location ? `<div class="contact-line">Location: ${esc(personalInfo.location)}</div>` : ''}
    ${personalInfo?.linkedinUrl ? `<div class="contact-line">LinkedIn: ${esc(personalInfo.linkedinUrl)}</div>` : ''}
    ${personalInfo?.githubUrl ? `<div class="contact-line">GitHub: ${esc(personalInfo.githubUrl)}</div>` : ''}
    ${personalInfo?.portfolioUrl ? `<div class="contact-line">Portfolio: ${esc(personalInfo.portfolioUrl)}</div>` : ''}

    ${
      skillGroups.length
        ? `<div class="side-h2">Skills</div>
        ${skillGroups
          .map(
            (g) => `
          <div class="skill-group-item">
            <div class="skill-group-cat">${esc(g.category)}</div>
            <div class="skill-group-text">${esc(g.items)}</div>
          </div>`,
          )
          .join('')}`
        : ''
    }

    ${
      languages.length
        ? `<div class="side-h2">Languages</div>${languages
            .map((l) => `<div class="side-lang"><span>${esc(l.languageName)}</span><span>${l.proficiencyLevel ? esc(l.proficiencyLevel.charAt(0) + l.proficiencyLevel.slice(1).toLowerCase()) : ''}</span></div>`)
            .join('')}`
        : ''
    }

    ${
      certifications.length
        ? `<div class="side-h2">Certifications</div>${certifications
            .map((c) => `<div class="contact-line">${esc(c.name)}${c.issuingOrganization ? ` — ${esc(c.issuingOrganization)}` : ''}</div>`)
            .join('')}`
        : ''
    }
  </aside>

  <!-- ==================== MAIN CONTENT ==================== -->
  <main class="main">
    ${resume.summary ? `<h2>Profile</h2><p class="summary">${esc(resume.summary)}</p>` : ''}

    ${
      experience.length
        ? `<h2>Experience</h2>${experience
            .map((e) => {
              const bullets = (e.description || '')
                .split('\n')
                .map((b) => b.trim())
                .filter(Boolean)

              return `
              <div class="entry">
                <div class="entry-head">
                  <span class="entry-title">${esc(e.jobTitle)}</span>
                  <span class="entry-date">${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate) || 'Present'}</span>
                </div>
                <div class="entry-sub">${esc(e.company)}</div>
                ${
                  bullets.length > 1
                    ? `<div class="entry-desc"><ul>${bullets.map((b) => `<li>${esc(b.replace(/^[•*-]\s*/, ''))}</li>`).join('')}</ul></div>`
                    : e.description
                      ? `<div class="entry-desc">${esc(e.description)}</div>`
                      : ''
                }
              </div>`
            })
            .join('')}`
        : ''
    }

    ${
      projects.length
        ? `<h2>Projects</h2>${projects
            .map((p) => {
              const bullets = (p.description || '')
                .split('\n')
                .map((b) => b.trim())
                .filter(Boolean)

              return `
              <div class="entry">
                <div class="entry-head">
                  <span class="entry-title">${esc(p.title)}</span>
                  ${p.startDate || p.endDate ? `<span class="entry-date">${fmtDate(p.startDate)} – ${p.currentlyBuilding ? 'Present' : fmtDate(p.endDate) || 'Present'}</span>` : ''}
                </div>
                ${
                  bullets.length > 1
                    ? `<div class="entry-desc"><ul>${bullets.map((b) => `<li>${esc(b.replace(/^[•*-]\s*/, ''))}</li>`).join('')}</ul></div>`
                    : p.description
                      ? `<div class="entry-desc">${esc(p.description)}</div>`
                      : ''
                }
              </div>`
            })
            .join('')}`
        : ''
    }

    ${
      education.length
        ? `<h2>Education</h2>${education
            .map(
              (ed) => `
            <div class="entry">
              <div class="entry-head">
                <span class="entry-title">${esc(ed.degree)}</span>
                <span class="entry-date">${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}</span>
              </div>
              <div class="entry-sub">${esc(ed.institution)}${ed.fieldOfStudy ? ` · ${esc(ed.fieldOfStudy)}` : ''}</div>
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
  </main>

</div></body></html>`
}

export const visionaryTemplate: TemplateDefinition = {
  id: 'the-visionary',
  name: 'The Visionary',
  description: 'Clean dark blue & cyan sidebar with photo portrait and structured text typography.',
  badge: 'Photo & Cyan Sidebar',
  render,
}
