import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, HelpCircle, ChevronDown, LogOut, Settings } from 'lucide-react'
import { Logo } from './Logo'
import { getUser } from '@/lib/session'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useQuery } from '@tanstack/react-query'
import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { UserProfile } from '@/features/settings/types/profile.types'

export function TopBar({ right, onSearch }: { right?: React.ReactNode; onSearch?: (query: string) => void }) {
  const sessionUser = getUser()
  const logout = useLogout()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: () =>
      unwrap(
        apiClient.get<ApiResponse<UserProfile>>('/api/users/me'),
      ),
    staleTime: 60_000,
  })

  const user = profile ?? sessionUser

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

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

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    if (onSearch) {
      onSearch(query.trim())
    } else {
      navigate(`/templates?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-ink-100 bg-paper-50/95 backdrop-blur-md px-5 lg:px-8 shadow-2xs">
      <Link to="/dashboard" className="shrink-0 lg:hidden">
        <Logo size="sm" />
      </Link>

      <form onSubmit={submitSearch} className="hidden max-w-md flex-1 items-center rounded-xl border border-ink-200 bg-paper-50 px-3.5 py-1.5 transition-all focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/10 sm:flex shadow-2xs">
        <Search className="mr-2.5 h-4 w-4 shrink-0 text-ink-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search templates or resumes…"
          className="w-full border-none bg-transparent text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
        <kbd className="hidden sm:inline-flex items-center rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-ink-600">
          ⌘K
        </kbd>
      </form>

      <div className="flex flex-1 items-center justify-end sm:flex-none">{right}</div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <a
          href="https://sidharthakuna.github.io/Portfolio/"
          target="_blank"
          rel="noreferrer"
          className="hidden h-9 w-9 items-center justify-center rounded-xl text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900 sm:flex"
          aria-label="Help"
          title="Portfolio / Help"
        >
          <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </a>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Dropdown */}
        <div className="relative ml-1" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-ink-200 bg-paper-50 py-1 pl-1 pr-2 hover:bg-slate-100 hover:border-ink-300 transition-all shadow-2xs"
          >
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-xs">
              {hasPhoto && !imgError ? (
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
            <span className="hidden sm:inline text-xs font-bold text-ink-800 max-w-[100px] truncate">
              {user?.fullName?.split(' ')[0] ?? 'Account'}
            </span>
            <ChevronDown className="h-3 w-3 text-ink-500" />
          </button>

          {open && (
            <div className="absolute right-0 top-11 w-52 overflow-hidden rounded-2xl border border-ink-200 bg-paper-50 py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
              <div className="border-b border-ink-100 px-3.5 py-2.5">
                <p className="truncate text-xs font-bold text-ink-900">{user?.fullName}</p>
                <p className="truncate text-[11px] font-medium text-ink-500">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50 transition-colors"
              >
                <Settings className="h-3.5 w-3.5" /> Settings
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-danger-600 hover:bg-danger-100/60 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
