import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadProfilePicture, deleteProfilePicture } from '@/features/settings/api/profilePicture.api'
import type { UserProfile } from '@/features/settings/types/profile.types'

/**
 * React Query mutations for profile picture upload and removal.
 *
 * Both mutations invalidate the 'userProfile' query on success so any
 * component reading the profile (avatar in sidebar, settings page, etc.)
 * automatically re-fetches and shows the new/removed photo.
 *
 * Usage:
 *   const { upload, remove, isUploading, isRemoving } = useProfilePicture()
 *   upload(file)   — upload a File object
 *   remove()       — delete the current picture
 */
export function useProfilePicture() {
  const queryClient = useQueryClient()

  const onSuccess = (data: UserProfile) => {
    // Optimistically update any cached user profile data.
    queryClient.setQueryData(['userProfile'], data)
    queryClient.invalidateQueries({ queryKey: ['userProfile'] })
  }

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProfilePicture(file),
    onSuccess: (data) => {
      onSuccess(data)
      toast.success('Profile picture updated!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to upload profile picture')
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => deleteProfilePicture(),
    onSuccess: (data) => {
      onSuccess(data)
      toast.success('Profile picture removed')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove profile picture')
    },
  })

  return {
    upload: (file: File) => uploadMutation.mutate(file),
    remove: () => removeMutation.mutate(),
    isUploading: uploadMutation.isPending,
    isRemoving: removeMutation.isPending,
    uploadedProfile: uploadMutation.data ?? null,
    removedProfile: removeMutation.data ?? null,
  }
}
