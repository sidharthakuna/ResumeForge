import type { ProjectResponse } from '@/types/api'
import { esc, fmtDate } from '../../renderers/types'

export interface ProjectsRenderOptions {
  titleTag?: 'h2' | 'div'
  titleClass?: string
  sectionTitle?: string
}

export function renderProjects(
  projects: ProjectResponse[] | null | undefined,
  opts: ProjectsRenderOptions = { titleTag: 'div', titleClass: 'section-title', sectionTitle: 'Projects' }
): string {
  if (!projects || projects.length === 0) return ''

  const tag = opts.titleTag || 'div'
  const titleCls = opts.titleClass || 'section-title'
  const heading = `<${tag} class="${titleCls}">${opts.sectionTitle || 'Projects'}</${tag}>`

  const entries = projects
    .map((p) => {
      const dates = `${fmtDate(p.startDate)}${p.endDate ? ` – ${fmtDate(p.endDate)}` : p.currentlyBuilding ? ' – Present' : ''}`
      const bullets = p.description
        ? `<ul class="bullets">${p.description
            .split('\n')
            .filter(Boolean)
            .map((b) => `<li>${esc(b.replace(/^[•*-]\s*/, ''))}</li>`)
            .join('')}</ul>`
        : ''

      return `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${esc(p.title)}</span>
            ${dates ? `<span class="entry-date">${dates}</span>` : ''}
          </div>
          ${bullets}
        </div>
      `
    })
    .join('')

  return `<div class="section">${heading}${entries}</div>`
}
