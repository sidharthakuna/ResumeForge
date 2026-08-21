import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Info, Trash2, Pencil, Check, X, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { apiClient, unwrap, ApiError } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import { getUser, updateStoredUser } from '@/lib/session'
import { listRegisteredResumeIds, unregisterResumeId } from '@/features/dashboard/lib/resume-registry'
import { SectionHeader } from '@/components/feedback/SectionHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { AvatarUpload } from '@/features/settings/components/AvatarUpload'
import { toast } from 'sonner'
import type { UserProfile } from '@/features/settings/types/profile.types'

type Tab = 'account' | 'resumes'

const TABS: { key: Tab; label: string; icon: typeof User }[] = [
  { key: 'account', label: 'Account Settings', icon: User },
  { key: 'resumes', label: 'Resumes on This Device', icon: Info },
]

export default function SettingsPage() {
  const sessionUser = getUser()
  const [tab, setTab] = useState<Tab>('account')
  const registry = listRegisteredResumeIds()
  const queryClient = useQueryClient()

  // Fetch fresh profile from API (includes profilePictureUrl from backend).
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: () =>
      unwrap(
        apiClient.get<ApiResponse<UserProfile>>('/api/users/me'),
      ),
    staleTime: 60_000,
  })

  const displayName = profile?.fullName ?? sessionUser?.fullName ?? ''
  const displayEmail = profile?.email ?? sessionUser?.email ?? ''
  const displayRole = profile?.role ?? sessionUser?.role ?? ''
  const profilePictureUrl = profile?.profilePictureUrl ?? null

  const [fullNameInput, setFullNameInput] = useState(displayName)
  const [isEditingName, setIsEditingName] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (displayName && !isEditingName) {
      setFullNameInput(displayName)
    }
  }, [displayName, isEditingName])

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus()
    }
  }, [isEditingName])

  const updateProfileMutation = useMutation({
    mutationFn: (newFullName: string) =>
      unwrap(
        apiClient.patch<ApiResponse<UserProfile>>('/api/users/me', { fullName: newFullName }),
      ),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      updateStoredUser({ fullName: updatedProfile.fullName })
      setIsEditingName(false)
      toast.success('Full name updated successfully!')
    },
    onError: (err: unknown) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update full name')
    },
  })

  const isNameChanged = fullNameInput.trim() !== '' && fullNameInput.trim() !== displayName

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault()
    if (isNameChanged) {
      updateProfileMutation.mutate(fullNameInput.trim())
    } else {
      setIsEditingName(false)
    }
  }

  const initials = (fullNameInput || displayName)
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="px-3.5 py-4 sm:px-6 sm:py-8 lg:px-8 pb-24 sm:pb-8">
      <SectionHeader title="Settings" description="Manage your account and local resume list." />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="flex flex-row overflow-x-auto gap-1.5 pb-1 lg:pb-0 lg:flex-col lg:space-y-1 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-xs sm:text-sm font-semibold transition-colors cursor-pointer',
                tab === t.key
                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-transparent shadow-2xs'
                  : 'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-slate-800/60',
              )}
            >
              <t.icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div>
          {tab === 'account' && (
            <Card>
              <CardHeader>
                <p className="text-sm font-bold text-ink-800">Profile Settings</p>
              </CardHeader>

              <CardBody className="space-y-6">
                {/* Avatar upload row */}
                <div className="flex items-start gap-4">
                  <AvatarUpload
                    currentUrl={profilePictureUrl}
                    initials={initials}
                    size="lg"
                  />
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-ink-900">{displayName}</p>
                    <p className="text-xs text-ink-500">
                      {displayRole === 'ADMIN' ? 'Administrator' : 'Member'}
                    </p>
                  </div>
                </div>

                {/* Name & email fields */}
                <form onSubmit={handleSaveName} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="full-name-input" className="mb-0">Full name</Label>
                        {!isEditingName && (
                          <button
                            type="button"
                            onClick={() => setIsEditingName(true)}
                            className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50 transition-colors"
                          >
                            <Pencil className="h-3 w-3 text-ink-500" />
                            Edit name
                          </button>
                        )}
                      </div>
                      <Input
                        ref={nameInputRef}
                        id="full-name-input"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        placeholder="Enter your full name"
                        disabled={!isEditingName}
                      />
                      {isEditingName && (
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="submit"
                            disabled={!isNameChanged || updateProfileMutation.isPending}
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 transition-colors"
                          >
                            {updateProfileMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Save name
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingName(false)
                              setFullNameInput(displayName)
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email-address-input" className="mb-1.5">Email address</Label>
                      <Input id="email-address-input" value={displayEmail} disabled />
                    </div>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {tab === 'resumes' && (
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-ink-800">Resumes tracked on this device</p>
              </CardHeader>
              <CardBody>
                <p className="mb-3 text-xs text-ink-500">
                  The dashboard tracks your opened resumes locally in this browser. Removing one here only
                  removes it from this list — it does not delete the resume itself.
                </p>
                {registry.length === 0 ? (
                  <p className="text-sm text-ink-400">No resumes tracked yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {registry.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2"
                      >
                        <span className="truncate text-xs text-ink-600">
                          Resume ···{entry.id.slice(-8)}
                        </span>
                        <button
                          onClick={() => {
                            unregisterResumeId(entry.id)
                            toast.success('Removed from this list')
                            window.location.reload()
                          }}
                          className="ml-3 shrink-0 text-danger-500 hover:text-danger-700"
                          aria-label="Remove from list"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
