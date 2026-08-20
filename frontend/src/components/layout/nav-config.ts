import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  User,
  Camera,
  Sparkles,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Wrench,
  Award,
  Trophy,
  Flame,
  Languages,
  Bot,
  Palette,
  Download,
  Settings,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: (resumeId: string) => string
  icon: LucideIcon
  /** true = lives under the resume editor and needs an active resumeId */
  scoped: boolean
}

export const dashboardNavItem: NavItem = {
  label: 'Dashboard',
  path: () => '/dashboard',
  icon: LayoutDashboard,
  scoped: false,
}

export const editorSections: NavItem[] = [
  { label: 'Personal', path: (id) => `/resumes/${id}/edit/personal`, icon: User, scoped: true },
  { label: 'Photo', path: (id) => `/resumes/${id}/edit/photo`, icon: Camera, scoped: true },
  { label: 'Education', path: (id) => `/resumes/${id}/edit/education`, icon: GraduationCap, scoped: true },
  { label: 'Experience', path: (id) => `/resumes/${id}/edit/experience`, icon: Briefcase, scoped: true },
  { label: 'Projects', path: (id) => `/resumes/${id}/edit/projects`, icon: FolderGit2, scoped: true },
  { label: 'Skills', path: (id) => `/resumes/${id}/edit/skills`, icon: Wrench, scoped: true },
  {
    label: 'Certifications',
    path: (id) => `/resumes/${id}/edit/certifications`,
    icon: Award,
    scoped: true,
  },
  {
    label: 'Achievements',
    path: (id) => `/resumes/${id}/edit/achievements`,
    icon: Trophy,
    scoped: true,
  },
  {
    label: 'Strengths',
    path: (id) => `/resumes/${id}/edit/strengths`,
    icon: Flame,
    scoped: true,
  },
  { label: 'Languages', path: (id) => `/resumes/${id}/edit/languages`, icon: Languages, scoped: true },
  { label: 'Summary', path: (id) => `/resumes/${id}/edit/summary`, icon: Sparkles, scoped: true },
]

export const toolSections: NavItem[] = [
  { label: 'AI Assistant', path: (id) => `/resumes/${id}/ai`, icon: Bot, scoped: true },
  { label: 'Templates', path: (id) => `/resumes/${id}/templates`, icon: Palette, scoped: true },
  { label: 'Export & History', path: (id) => `/resumes/${id}/export`, icon: Download, scoped: true },
]

export const settingsNavItem: NavItem = {
  label: 'Settings',
  path: () => '/settings',
  icon: Settings,
  scoped: false,
}
