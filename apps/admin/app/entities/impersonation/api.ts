import { api } from '~/shared/api/client'

export function startImpersonation(body: { tenantId: string; reason: string; totpCode?: string }) {
  return api.post('/admin/impersonation', body)
}

export function stopImpersonation() {
  return api.delete('/admin/impersonation')
}
