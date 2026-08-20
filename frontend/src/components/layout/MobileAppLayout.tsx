import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  FileText,
  Layers,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bot,
} from 'lucide-react'
import { Logo } from './Logo'
import { getUser } from '@/lib/session'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { UserProfile } from '@/features/settings/types/profile.types'
import navStyles from './MobileAppNav.module.css'

interface MobileAppLayoutProps {
  children: React.ReactNode
  onSearch?: (query: string) => void
}

export function MobileAppLayout({ children, onSearch }: MobileAppLayoutProps) {
  const sessionUser = getUser()
  const logout = useLogout()
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  // Reset imgError if profile url changes
  useEffect(() => {
    setImgError(false)
    setCacheBust(Date.now())
  }, [profile?.profilePictureUrl])

  const isDashboardActive = location.pathname === '/dashboard' || location.pathname === '/'
  const isMyResumesActive = location.pathname === '/resumes'
  const isTemplatesActive = location.pathname.startsWith('/templates')
  const isAiActive = location.pathname.startsWith('/ai')
  const isSettingsActive = location.pathname.startsWith('/settings')

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    if (onSearch) {
      onSearch(searchQuery.trim())
    } else {
      navigate(`/templates?q=${encodeURIComponent(searchQuery.trim())}`)
    }
    setSearchOpen(false)
  }

  return (
    <div className="mobile-app-root lg:hidden">
      {/* Mobile Top App Bar */}
      <header className="mobile-top-header">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            className="mobile-header-btn"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="mobile-header-btn"
            aria-label="Search"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <ThemeToggle />
          <Link
            to="/settings"
            className="flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-xs font-semibold leading-none text-white shadow-2xs"
          >
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
          </Link>
        </div>
      </header>

      {/* Mobile Search Overlay Bar */}
      {searchOpen && (
        <div className="mobile-search-panel animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search resumes or templates…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-ink-400 hover:text-ink-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Main Page Body with Safe Bottom Clearance */}
      <main className="mobile-main-body">{children}</main>

      {/* Navigation Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink-950/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="mobile-drawer-sheet animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="mobile-drawer-top">
              <Logo size="sm" />
              <button
                onClick={() => setDrawerOpen(false)}
                className="mobile-header-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 space-y-6 overflow-y-auto p-4">
              {/* Main Navigation */}
              <nav className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-ink-400">Navigation</p>
                <Link
                  to="/dashboard"
                  onClick={() => setDrawerOpen(false)}
                  className={clsx(
                    'mobile-drawer-item',
                    isDashboardActive && 'mobile-drawer-item-active',
                  )}
                >
                  <LayoutDashboard className="h-4.5 w-4.5" /> Dashboard
                </Link>
                <Link
                  to="/resumes"
                  onClick={() => setDrawerOpen(false)}
                  className={clsx(
                    'mobile-drawer-item',
                    isMyResumesActive && 'mobile-drawer-item-active',
                  )}
                >
                  <FileText className="h-4.5 w-4.5" /> My Resumes
                </Link>
                <Link
                  to="/templates"
                  onClick={() => setDrawerOpen(false)}
                  className={clsx(
                    'mobile-drawer-item',
                    isTemplatesActive && 'mobile-drawer-item-active',
                  )}
                >
                  <Layers className="h-4.5 w-4.5" /> Templates
                </Link>
                <Link
                  to="/ai"
                  onClick={() => setDrawerOpen(false)}
                  className={clsx(
                    'mobile-drawer-item',
                    isAiActive && 'mobile-drawer-item-active',
                  )}
                >
                  <Bot className="h-4.5 w-4.5" /> AI Assistant
                </Link>
              </nav>

              {/* Action */}
              <div>
                <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-ink-400 mb-1">Create</p>
                <Link
                  to="/dashboard?create=1"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
                >
                  <PlusCircle className="h-4.5 w-4.5" /> Create Resume
                </Link>
              </div>

              {/* Account */}
              <nav className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-ink-400">Account</p>
                <Link
                  to="/settings"
                  onClick={() => setDrawerOpen(false)}
                  className={clsx(
                    'mobile-drawer-item',
                    isSettingsActive && 'mobile-drawer-item-active',
                  )}
                >
                  <Settings className="h-4.5 w-4.5" /> Settings
                </Link>
              </nav>
            </div>

            {/* Footer */}
            <div className="mobile-drawer-bottom">
              <button
                onClick={() => {
                  setDrawerOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-danger-600 hover:bg-danger-100/60"
              >
                <LogOut className="h-4.5 w-4.5" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className={navStyles.bottomNav}>
        {/* Home */}
        <Link
          to="/dashboard"
          className={clsx(
            navStyles.navItem,
            isDashboardActive ? navStyles.navItemActive : navStyles.navItemInactive,
          )}
        >
          <div className={navStyles.iconBox}>
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className={navStyles.label}>Home</span>
        </Link>

        {/* Resumes */}
        <Link
          to="/resumes"
          className={clsx(
            navStyles.navItem,
            isMyResumesActive ? navStyles.navItemActive : navStyles.navItemInactive,
          )}
        >
          <div className={navStyles.iconBox}>
            <FileText className="h-5 w-5" />
          </div>
          <span className={navStyles.label}>Resumes</span>
        </Link>

        {/* Create (Elevated Hero Button) */}
        <Link
          to="/dashboard?create=1"
          className={navStyles.createItem}
        >
          <div className={navStyles.createIconBox}>
            <PlusCircle className="h-5 w-5 stroke-[2.2]" />
          </div>
          <span className={navStyles.createLabel}>Create</span>
        </Link>

        {/* Templates */}
        <Link
          to="/templates"
          className={clsx(
            navStyles.navItem,
            isTemplatesActive ? navStyles.navItemActive : navStyles.navItemInactive,
          )}
        >
          <div className={navStyles.iconBox}>
            <Layers className="h-5 w-5" />
          </div>
          <span className={navStyles.label}>Templates</span>
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className={clsx(
            navStyles.navItem,
            isSettingsActive ? navStyles.navItemActive : navStyles.navItemInactive,
          )}
        >
          <div className={navStyles.iconBox}>
            <Settings className="h-5 w-5" />
          </div>
          <span className={navStyles.label}>Settings</span>
        </Link>
      </nav>
    </div>
  )
}
