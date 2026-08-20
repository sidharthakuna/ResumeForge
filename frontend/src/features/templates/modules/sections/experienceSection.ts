import type { ExperienceResponse } from '@/types/api'
import { esc, fmtDate } from '../../renderers/types'

export interface ExperienceRenderOptions {
  titleTag?: 'h2' | 'div'
  titleClass?: string
  sectionTitle?: string
}

export function renderExperience(
  experiences: ExperienceResponse[] | null | undefined,
  opts: ExperienceRenderOptions = { titleTag: 'div', titleClass: 'section-title', sectionTitle: 'Experience' }
): string {
  if (!experiences || experiences.length === 0) return ''

  const tag = opts.titleTag || 'div'
  const titleCls = opts.titleClass || 'section-title'
  const heading = `<${tag} class="${titleCls}">${opts.sectionTitle || 'Experience'}</${tag}>`

  const entries = experiences
    .map((e) => {
      const dates = `${fmtDate(e.startDate)} – ${e.currentlyWorking ? 'Present' : fmtDate(e.endDate) || 'Present'}`
      const bullets = e.description
        ? `<ul class="bullets">${e.description
            .split('\n')
            .filter(Boolean)
            .map((b) => `<li>${esc(b.replace(/^[•*-]\s*/, ''))}</li>`)
            .join('')}</ul>`
        : ''

      return `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${esc(e.jobTitle)} — ${esc(e.company)}</span>
            <span class="entry-date">${dates}</span>
          </div>
          ${bullets}
        </div>
      `
    })
    .join('')

  return `<div class="section">${heading}${entries}</div>`
}
