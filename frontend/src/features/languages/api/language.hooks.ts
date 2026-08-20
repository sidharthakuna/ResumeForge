import { createSubResourceHooks } from '@/lib/createSubResourceHooks'
import { languageApi } from './language.api'
import type { LanguageRequest, LanguageResponse } from '@/types/api'

export const {
  useAdd: useAddLanguage,
  useUpdate: useUpdateLanguage,
  useRemove: useRemoveLanguage,
} = createSubResourceHooks<LanguageRequest, LanguageResponse>(languageApi, 'Language')
