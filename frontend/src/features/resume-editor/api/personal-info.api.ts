import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, PersonalInfoRequest, PersonalInfoResponse } from '@/types/api'

// Create-once, then must PUT (backend throws PersonalInfoAlreadyExistsException
// on a second POST — see ResumeService.addPersonalInfo). The editor UI must
// always check FullResumeResponse.personalInfo for null/non-null before
// deciding whether to call add() or update().
export const personalInfoApi = {
  add: (resumeId: string, body: PersonalInfoRequest) =>
    unwrap(
      apiClient.post<ApiResponse<PersonalInfoResponse>>(`/api/resumes/${resumeId}/personal-info`, body),
    ),
  update: (personalInfoId: string, body: PersonalInfoRequest) =>
    unwrap(
      apiClient.put<ApiResponse<PersonalInfoResponse>>(
        `/api/resumes/personal-info/${personalInfoId}`,
        body,
      ),
    ),
}
