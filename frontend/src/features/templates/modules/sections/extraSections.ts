import type { CertificationResponse, AchievementResponse, LanguageResponse } from '@/types/api'
import { esc, fmtDate } from '../../renderers/types'

export function renderSummary(summary: string | null | undefined, title: string = 'Professional Summary', titleTag: 'h2' | 'div' = 'div'): string {
  if (!summary || !summary.trim()) return ''
  return `
    <div class="section">
      <${titleTag} class="section-title">${title}</${titleTag}>
      <div class="summary-text" style="line-height:1.55;color:inherit;">${esc(summary)}</div>
    </div>
  `
}

export function renderCertifications(certs: CertificationResponse[] | null | undefined, format: 'inline' | 'sidebar' = 'inline', titleTag: 'h2' | 'div' = 'div'): string {
  if (!certs || certs.length === 0) return ''

  if (format === 'sidebar') {
    const items = certs
      .map(
        (c) => `<div class="sidebar-item">
          <strong>${esc(c.name)}</strong>
          <span class="sub">${esc(c.issuingOrganization)}${c.issueDate ? ` — ${fmtDate(c.issueDate)}` : ''}</span>
        </div>`
      )
      .join('')
    return `<div class="sidebar-section-title">Certifications</div>${items}`
  }

  const entries = certs
    .map(
      (c) => `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${esc(c.name)}</span>
            <span class="entry-date">${fmtDate(c.issueDate)}</span>
          </div>
          <div class="entry-sub">${esc(c.issuingOrganization)}</div>
        </div>
      `
    )
    .join('')

  return `<div class="section"><${titleTag} class="section-title">Certifications</${titleTag}>${entries}</div>`
}

export function renderAchievements(achievements: AchievementResponse[] | null | undefined, format: 'inline' | 'sidebar' = 'inline', titleTag: 'h2' | 'div' = 'div'): string {
  if (!achievements || achievements.length === 0) return ''

  if (format === 'sidebar') {
    const items = achievements
      .map(
        (a) => `<div class="sidebar-item">
          <strong>${esc(a.title)}</strong>
          ${a.issuer ? `<span class="sub">${esc(a.issuer)}${a.achievementDate ? ` — ${fmtDate(a.achievementDate)}` : ''}</span>` : ''}
        </div>`
      )
      .join('')
    return `<div class="sidebar-section-title">Awards &amp; Honors</div>${items}`
  }

  const entries = achievements
    .map(
      (a) => `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${esc(a.title)}</span>
            <span class="entry-date">${fmtDate(a.achievementDate)}</span>
          </div>
          ${a.issuer ? `<div class="entry-sub">${esc(a.issuer)}</div>` : ''}
        </div>
      `
    )
    .join('')

  return `<div class="section"><${titleTag} class="section-title">Achievements</${titleTag}>${entries}</div>`
}

export function renderLanguages(languages: LanguageResponse[] | null | undefined, format: 'inline' | 'sidebar' = 'inline', titleTag: 'h2' | 'div' = 'div'): string {
  if (!languages || languages.length === 0) return ''

  if (format === 'sidebar') {
    const items = languages
      .map(
        (l) => `<div class="sidebar-item">
          <strong>${esc(l.languageName)}</strong>
          ${l.proficiencyLevel ? `<span class="sub">${esc(l.proficiencyLevel)}</span>` : ''}
        </div>`
      )
      .join('')
    return `<div class="sidebar-section-title">Languages</div>${items}`
  }

  const list = languages
    .map((l) => `${esc(l.languageName)}${l.proficiencyLevel ? ` (${esc(l.proficiencyLevel)})` : ''}`)
    .join(' • ')

  return `<div class="section"><${titleTag} class="section-title">Languages</${titleTag}><div style="font-size:10.5px;color:inherit;">${list}</div></div>`
}

export function renderDeclaration(declaration: string | null | undefined, signerName: string = '', titleTag: 'h2' | 'div' = 'div'): string {
  if (!declaration || !declaration.trim()) return ''
  return `
    <div class="section">
      <${titleTag} class="section-title">Declaration</${titleTag}>
      <div class="declaration-box" style="font-size:10px;font-style:italic;margin-top:6px;line-height:1.45;">
        <div>${esc(declaration)}</div>
        ${signerName ? `<div style="font-style:normal;font-weight:700;margin-top:4px;">${esc(signerName)}</div>` : ''}
      </div>
    </div>
  `
}
