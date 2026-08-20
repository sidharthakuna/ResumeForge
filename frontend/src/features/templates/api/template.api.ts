import { apiClient, unwrap } from '@/lib/axios'
import type { ApiResponse, TemplateListResponse } from '@/types/api'

// Backend's Thymeleaf template catalog (MODERN/CLASSIC only — see
// ResumeTemplate.java). Kept for the preview-html/preview-pdf/generate
// endpoints, which still key off this enum. Frontend-rendered templates
// (features/templates/renderers/*) are a separate, larger catalog and do
// NOT come from this endpoint.
export const templateApi = {
  list: () => unwrap(apiClient.get<ApiResponse<TemplateListResponse>>('/api/templates')),
}
