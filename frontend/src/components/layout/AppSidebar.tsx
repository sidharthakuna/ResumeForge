import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  FileText,
  Layers,
  Plus,
  User,
  Settings,
  LogOut,
  Bot,
  Sparkles,
} from 'lucide-react'
import { Logo } from './Logo'
import { getUser } from '@/lib/session'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { UserProfile } from '@/features/settings/types/profile.types'
import { useDashboardResumes } from '@/features/dashboard/api/useDashboardResumes'

/**
 * The persistent left navigation rail for non-editor views (Dashboard,
 * Templates Gallery, AI Assistant, and Settings).
 */
export function AppSidebar() {
  const sessionUser = getUser()
  const logout = useLogout()
  const location = useLocation()
  const { data: resumes } = useDashboardResumes()
  const totalResumes = resumes?.length ?? 0

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: () =>
      unwrap(
        apiClient.get<ApiResponse<UserProfile>>('/api/users/me'),
      ),
    staleTime: 60_000,
  })

  const user = profile ?? sessionUser

  const initials = (user?.fullName || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const [cacheBust, setCacheBust] = useState(Date.now())
  const hasPhoto = !!profile?.profilePictureUrl
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
    setCacheBust(Date.now())
  }, [profile?.profilePictureUrl])

  const isDashboardActive = location.pathname === '/dashboard' || location.pathname === '/'
  const isMyResumesActive = location.pathname === '/resumes'
  const isTemplatesActive = location.pathname.startsWith('/templates')
  const isAiActive = location.pathname.startsWith('/ai')
  const isProfileActive =
    location.pathname === '/settings' && (!location.hash || location.hash !== '#profile')
  const isSettingsActive = location.pathname === '/settings' && location.hash === '#preferences'

  const navItemClass = (isActive: boolean) =>
    clsx(
      'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150',
      isActive
        ? 'bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-transparent shadow-2xs'
        : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-500 dark:hover:bg-ink-100/50 dark:hover:text-ink-900',
    )

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 shrink-0 flex-col border-r border-ink-100 bg-paper-50 shadow-xs lg:flex">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 pb-5 pt-6 border-b border-ink-100/80">
        <Logo size="md" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto scrollbar-thin px-4 py-5">
        <div>
          <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
            Workspace
          </p>
          <ul className="space-y-1">
            <li>
              <Link to="/dashboard" className={navItemClass(isDashboardActive)}>
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="h-4 w-4 shrink-0 stroke-[2]" />
                  <span>Dashboard</span>
                </span>
              </Link>
            </li>
            <li>
              <Link to="/resumes" className={navItemClass(isMyResumesActive)}>
                <span className="flex items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 stroke-[2]" />
                  <span>My Resumes</span>
                </span>
                <span className="rounded-full bg-ink-100 dark:bg-ink-200 px-2 py-0.5 text-[10px] font-mono text-ink-600">
                  {totalResumes}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/templates" className={navItemClass(isTemplatesActive)}>
                <span className="flex items-center gap-3">
                  <Layers className="h-4 w-4 shrink-0 stroke-[2]" />
                  <span>Templates</span>
                </span>
                <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  4 Styles
                </span>
              </Link>
            </li>
            <li>
              <Link to="/ai" className={navItemClass(isAiActive)}>
                <span className="flex items-center gap-3">
                  <Bot className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400 stroke-[2]" />
                  <span>AI Assistant</span>
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-purple-600 dark:text-purple-400">
                  <Sparkles className="h-3 w-3" />
                  Gemini
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Primary Action Button */}
        <div>
          <Link
            to="/dashboard?create=1"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-indigo-700 active:bg-indigo-800"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Create New Resume</span>
          </Link>
        </div>

        {/* Preferences / Account Settings */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
            Preferences
          </p>
          <ul className="space-y-1">
            <li>
              <Link to="/settings#profile" className={navItemClass(isProfileActive)}>
                <span className="flex items-center gap-3">
                  <User className="h-4 w-4 shrink-0 stroke-[2]" />
                  <span>Profile & Contact</span>
                </span>
              </Link>
            </li>
            <li>
              <Link to="/settings#preferences" className={navItemClass(isSettingsActive)}>
                <span className="flex items-center gap-3">
                  <Settings className="h-4 w-4 shrink-0 stroke-[2]" />
                  <span>Settings</span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-ink-100 p-3.5">
        <div className="flex items-center gap-3 rounded-xl border border-ink-200/80 bg-ink-50/60 p-2.5 dark:bg-paper-100/50">
          <span className="flex h-8 w-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-xs font-bold text-white shadow-xs">
            {hasPhoto && !imgError && profile ? (
              <img
                src={`${profile.profilePictureUrl}?t=${cacheBust}`}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              initials
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold leading-tight text-ink-900">{user?.fullName}</p>
            <p className="truncate text-[10px] font-medium leading-tight text-ink-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-paper-50 hover:text-danger-600 transition-colors"
            aria-label="Log out"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5 stroke-[2]" />
          </button>
        </div>
      </div>
    </aside>
  )
}
