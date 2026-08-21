import { emeraldSidebarTemplate } from './emeraldSidebar'
import { editorialColumnsTemplate } from './editorialColumns'
import { techModernTemplate } from './techModern'
import { techAtsTemplate } from './techAts'
import { sidharthaClassicTemplate } from './sidharthaClassic'
import { executiveSerifTemplate } from './executiveSerif'
import { modernSplitTemplate } from './modernSplit'
import { graduateTemplate } from './graduate'
import { navyBannerTemplate } from './navyBanner'
import { sidebarMinimalistTemplate } from './sidebarMinimalist'
import { standardTemplate } from './classic'
import { directorTemplate } from './modern'
import { essentialTemplate } from './minimal'
import { visionaryTemplate } from './visionary'
import type { TemplateDefinition, TemplateCategory } from './types'
export { templateSupportsPhoto } from './types'

export interface CategoryGroup {
  key: TemplateCategory
  label: string
  description: string
  iconName: string
}

export const TEMPLATE_CATEGORIES: CategoryGroup[] = [
  { key: 'all', label: 'All Templates', description: 'Browse all curated resume templates', iconName: 'LayoutGrid' },
  { key: 'ats', label: 'ATS Friendly', description: 'Scored for 100% parseability by ATS bots', iconName: 'FileCheck2' },
  { key: 'two-column', label: '2 Column', description: 'Balanced 2-column & split sidebar formats', iconName: 'Columns2' },
  { key: 'single-column', label: 'Single Column', description: 'Traditional & modern single-column layouts', iconName: 'Rows3' },
  { key: 'project-based', label: 'Project Based', description: 'Built to showcase coding projects & portfolios', iconName: 'FolderGit2' },
  { key: 'experience-based', label: 'Experience Based', description: 'Emphasizes career progression & achievements', iconName: 'Briefcase' },
  { key: 'studies-based', label: 'Studies & Academic', description: 'Tailored for university students & new graduates', iconName: 'GraduationCap' },
  { key: 'photo', label: 'Photo & Executive', description: 'Photo-enabled portraits & leadership designs', iconName: 'Camera' },
]

/**
 * Catalog of all 14 curated resume templates with rich categorizations.
 */
export const templateRegistry: TemplateDefinition[] = [
  {
    ...editorialColumnsTemplate,
    categories: ['two-column', 'project-based', 'studies-based', 'ats'],
    badge: '2 Column',
    layout: 'two-column',
    focus: 'developer',
  },
  {
    ...techAtsTemplate,
    categories: ['ats', 'single-column', 'experience-based'],
    badge: 'ATS Friendly',
    layout: 'single-column',
    focus: 'ats',
  },
  {
    ...techModernTemplate,
    categories: ['single-column', 'project-based', 'studies-based'],
    badge: 'Project Based',
    layout: 'single-column',
    focus: 'developer',
  },
  {
    ...sidharthaClassicTemplate,
    categories: ['studies-based', 'ats', 'single-column', 'project-based'],
    badge: 'Studies & Academic',
    layout: 'single-column',
    focus: 'student',
  },
  {
    ...graduateTemplate,
    categories: ['studies-based', 'single-column', 'project-based'],
    badge: 'Studies Based',
    layout: 'single-column',
    focus: 'student',
  },
  {
    ...executiveSerifTemplate,
    categories: ['experience-based', 'single-column'],
    badge: 'Experience Based',
    layout: 'single-column',
    focus: 'executive',
  },
  {
    ...emeraldSidebarTemplate,
    categories: ['two-column', 'photo', 'project-based', 'experience-based'],
    badge: 'Photo & Emerald',
    layout: 'sidebar',
    focus: 'creative',
    supportsPhoto: true,
  },
  {
    ...modernSplitTemplate,
    categories: ['two-column', 'project-based', 'ats'],
    badge: '2 Column Split',
    layout: 'two-column',
    focus: 'developer',
  },
  {
    ...navyBannerTemplate,
    categories: ['experience-based', 'single-column'],
    badge: 'Experience Based',
    layout: 'single-column',
    focus: 'executive',
  },
  {
    ...sidebarMinimalistTemplate,
    categories: ['two-column', 'photo', 'ats', 'experience-based'],
    badge: 'Photo & Blue Sidebar',
    layout: 'sidebar',
    focus: 'ats',
    supportsPhoto: true,
  },
  {
    ...standardTemplate,
    categories: ['ats', 'single-column', 'experience-based'],
    badge: 'ATS Friendly',
    layout: 'single-column',
    focus: 'ats',
  },
  {
    ...directorTemplate,
    categories: ['single-column', 'experience-based', 'project-based'],
    badge: 'Single Column',
    layout: 'single-column',
    focus: 'executive',
  },
  {
    ...essentialTemplate,
    categories: ['ats', 'single-column'],
    badge: 'ATS Minimal',
    layout: 'single-column',
    focus: 'ats',
  },
  {
    ...visionaryTemplate,
    categories: ['two-column', 'photo', 'project-based'],
    badge: 'Photo & Cyan Sidebar',
    layout: 'sidebar',
    focus: 'creative',
    supportsPhoto: true,
  },
]

export function getTemplateById(id: string): TemplateDefinition {
  return templateRegistry.find((t) => t.id === id) ?? templateRegistry[0]
}
