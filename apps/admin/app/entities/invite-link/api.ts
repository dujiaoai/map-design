import { api } from '~/shared/api/client'

import type {
  CreateTenantInviteLinkPayload,
  CreateTenantInviteLinkResponse,
  TenantInviteLinkListResponse,
  TenantInviteLinkSummary,
} from './model'

export function fetchTenantInviteLinks(tenantId: string) {
  return api.get<TenantInviteLinkListResponse>(`/admin/tenants/${tenantId}/invite-links`)
}

export function createTenantInviteLink(
  tenantId: string,
  payload: CreateTenantInviteLinkPayload,
) {
  return api.post<CreateTenantInviteLinkResponse>(`/admin/tenants/${tenantId}/invite-links`, payload)
}

export function revokeTenantInviteLink(tenantId: string, linkId: string) {
  return api.delete<TenantInviteLinkSummary>(
    `/admin/tenants/${tenantId}/invite-links/${linkId}`,
  )
}
