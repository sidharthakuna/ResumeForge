import type { FullResumeResponse } from '@/types/api'

export type TemplateCategory =
  | 'all'
  | 'ats'
  | 'two-column'
  | 'single-column'
  | 'project-based'
  | 'experience-based'
  | 'studies-based'
  | 'photo'

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  /** Short label shown as a colored pill on the gallery card, e.g. "ATS Friendly", "2 Column", "Project Based". */
  badge?: string
  /** Category tags for multi-filtering (ATS, 2-Column, Single-Column, Project-Based, Experience-Based, Studies-Based, Photo) */
  categories?: TemplateCategory[]
  /** Layout structure */
  layout?: 'single-column' | 'two-column' | 'sidebar'
  /** Primary design focus */
  focus?: 'ats' | 'developer' | 'executive' | 'student' | 'creative'
  /** Renders the resume to a full standalone HTML document string, used both for the live preview iframe and for generate-from-html export. */
  render: (full: FullResumeResponse) => string
}

/** Shared inline CSS reset + print rules every template document includes. */
export const baseDocumentStyles = `
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', -apple-system, sans-serif; color: #1c2c4f; }
  .page { width: 210mm; min-height: 297mm; padding: 18mm 20mm; margin: 0 auto; background: #fff; }
  a { color: inherit; }
  @media print {
    body { background: #fff; }
    .page { box-shadow: none; margin: 0; }
  }
`

export function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr || !dateStr.trim()) return ''
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

function esc(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
export { esc }
