import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowLeft, Palette, Type } from 'lucide-react'
import { getEditorSections, toolSections } from './nav-config'
import { useEditorUiStore } from '@/features/resume-editor/store/editor-ui.store'
import { getTemplateById, templateSupportsPhoto } from '@/features/templates/renderers/registry'

interface EditorSidebarProps {
  resumeId: string
}

// The leftmost "Content" column of the editor's 3-panel shape. Kept
// separate from the app-level AppSidebar since it needs an active
// resumeId and shows per-section completion, not the app-wide nav.
type SectionTone = 'amber' | 'indigo' | 'emerald' | 'purple' | 'cyan' | 'rose' | 'blue' | 'teal'

const sectionColors: Record<string, SectionTone> = {
  Personal: 'amber',
  Photo: 'emerald',
  Summary: 'indigo',
  Education: 'emerald',
  Experience: 'purple',
  Projects: 'cyan',
  Skills: 'indigo',
  Certifications: 'amber',
  Achievements: 'blue',
  Strengths: 'amber',
  Languages: 'teal',
  'AI Assistant': 'purple',
  Templates: 'emerald',
  'Export & History': 'indigo',
}

const toneStyles: Record<SectionTone, string> = {
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold border-l-2 border-amber-500',
  indigo: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold border-l-2 border-indigo-500',
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border-l-2 border-emerald-500',
  purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold border-l-2 border-purple-500',
  cyan: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold border-l-2 border-cyan-500',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 font-semibold border-l-2 border-rose-600',
  blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold border-l-2 border-blue-500',
  teal: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 font-semibold border-l-2 border-teal-500',
}

export function EditorSidebar({ resumeId }: EditorSidebarProps) {
  const selectedTemplateId = useEditorUiStore((s) => s.getSelectedTemplate(resumeId))
  const template = getTemplateById(selectedTemplateId)
  const supportsPhoto = templateSupportsPhoto(template)
  const visibleSections = getEditorSections(supportsPhoto)

  const getLinkClass = (label: string) => ({ isActive }: { isActive: boolean }) => {
    const tone = sectionColors[label] || 'indigo'
    return clsx(
      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all',
      isActive ? toneStyles[tone] : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
    )
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-ink-100 bg-paper-50">
      <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-4">
        <NavLink
          to="/dashboard"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-500 hover:bg-ink-50 hover:text-ink-800"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </NavLink>
        <span className="text-xs font-bold uppercase tracking-widest text-ink-400">Content</span>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-3">
        <ul className="space-y-1">
          {visibleSections.map((item) => (
            <li key={item.label}>
              <NavLink to={item.path(resumeId)} className={getLinkClass(item.label)}>
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="my-3.5 border-t border-ink-100" />
        <p className="px-3 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-widest text-ink-300">Tools</p>

        <ul className="space-y-1">
          {toolSections.map((item) => (
            <li key={item.label}>
              <NavLink to={item.path(resumeId)} className={getLinkClass(item.label)}>
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="px-3 pb-1.5 pt-5 text-[11px] font-bold uppercase tracking-widest text-ink-300">Design</p>
        <ul className="space-y-1">
          <li>
            <span className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-300">
              <Palette className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              Theme &amp; Colors
            </span>
          </li>
          <li>
            <span className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-300">
              <Type className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              Typography
            </span>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
