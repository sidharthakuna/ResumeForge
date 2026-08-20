import type { EducationResponse } from '@/types/api'
import { esc, fmtDate } from '../../renderers/types'

export interface EducationRenderOptions {
  titleTag?: 'h2' | 'div'
  titleClass?: string
  sectionTitle?: string
}

export function renderEducation(
  educationList: EducationResponse[] | null | undefined,
  opts: EducationRenderOptions = { titleTag: 'div', titleClass: 'section-title', sectionTitle: 'Education' }
): string {
  if (!educationList || educationList.length === 0) return ''

  const tag = opts.titleTag || 'div'
  const titleCls = opts.titleClass || 'section-title'
  const heading = `<${tag} class="${titleCls}">${opts.sectionTitle || 'Education'}</${tag}>`

  const entries = educationList
    .map((ed) => {
      const dates = `${fmtDate(ed.startDate)} – ${fmtDate(ed.endDate) || 'Present'}`
      const degreeLine = `${esc(ed.degree)}${ed.fieldOfStudy ? ` in ${esc(ed.fieldOfStudy)}` : ''}${(ed as any).grade ? ` (${esc((ed as any).grade)})` : ''}`

      return `
        <div class="entry">
          <div class="entry-header">
            <span class="entry-title">${esc(ed.institution)}</span>
            <span class="entry-date">${dates}</span>
          </div>
          <div class="entry-sub">${degreeLine}</div>
        </div>
      `
    })
    .join('')

  return `<div class="section">${heading}${entries}</div>`
}
