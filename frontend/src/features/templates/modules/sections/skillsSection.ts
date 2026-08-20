import type { SkillResponse } from '@/types/api'
import { esc } from '../../renderers/types'

export interface SkillsRenderOptions {
  titleTag?: 'h2' | 'div'
  titleClass?: string
  sectionTitle?: string
  format?: 'table' | 'rows' | 'sidebar'
}

export function renderSkills(
  skills: SkillResponse[] | null | undefined,
  opts: SkillsRenderOptions = { titleTag: 'div', titleClass: 'section-title', sectionTitle: 'Technical Skills', format: 'table' }
): string {
  if (!skills || skills.length === 0) return ''

  const tag = opts.titleTag || 'div'
  const titleCls = opts.titleClass || 'section-title'
  const heading = `<${tag} class="${titleCls}">${opts.sectionTitle || 'Technical Skills'}</${tag}>`

  if (opts.format === 'sidebar') {
    const items = skills
      .map((s) => {
        const parts = s.name.split(':')
        if (parts.length > 1) {
          return `<div class="sidebar-item"><strong>${esc(parts[0].trim())}</strong><span class="sub">${esc(parts.slice(1).join(':').trim())}</span></div>`
        }
        return `<div class="sidebar-item">${esc(s.name)}</div>`
      })
      .join('')
    return `<div class="sidebar-section-title">${opts.sectionTitle || 'Skills'}</div><div class="sidebar-skills">${items}</div>`
  }

  if (opts.format === 'rows') {
    const rows = skills
      .map((s) => {
        const parts = s.name.split(':')
        if (parts.length > 1) {
          return `<div class="skills-row"><strong>${esc(parts[0].trim())}:</strong> ${esc(parts.slice(1).join(':').trim())}</div>`
        }
        return `<div class="skills-row">${esc(s.name)}</div>`
      })
      .join('')
    return `<div class="section">${heading}${rows}</div>`
  }

  // Default: Categorized Table
  const tableRows = skills
    .map((s) => {
      const parts = s.name.split(':')
      if (parts.length > 1) {
        return `<tr><td class="skills-cat">${esc(parts[0].trim())}:</td><td class="skills-val">${esc(parts.slice(1).join(':').trim())}</td></tr>`
      }
      return `<tr><td colspan="2" class="skills-val">${esc(s.name)}</td></tr>`
    })
    .join('')

  return `<div class="section">${heading}<table class="skills-table"><tbody>${tableRows}</tbody></table></div>`
}
