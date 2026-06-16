import { api } from '~/shared/api/client'

import type { AdminMfaStatusResponse, TotpEnrollResponse } from './model'

export function fetchAdminMfaStatus() {
  return api.get<AdminMfaStatusResponse>('/admin/mfa/status')
}

export function enrollAdminTotp() {
  return api.post<TotpEnrollResponse>('/admin/mfa/totp/enroll')
}

export function verifyAdminTotp(code: string) {
  return api.post<AdminMfaStatusResponse>('/admin/mfa/totp/verify', { code })
}

export function disableAdminTotp(code: string) {
  return api.request<AdminMfaStatusResponse>('/admin/mfa/totp', {
    method: 'DELETE',
    body: { code },
  })
}

export function regenerateAdminRecoveryCodes(code: string) {
  return api.post<AdminMfaStatusResponse>('/admin/mfa/recovery-codes/regenerate', { code })
}
