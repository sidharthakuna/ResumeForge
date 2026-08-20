import { createSubResourceHooks } from '@/lib/createSubResourceHooks'
import { certificationApi } from './certification.api'
import type { CertificationRequest, CertificationResponse } from '@/types/api'

export const {
  useAdd: useAddCertification,
  useUpdate: useUpdateCertification,
  useRemove: useRemoveCertification,
} = createSubResourceHooks<CertificationRequest, CertificationResponse>(certificationApi, 'Certification')
