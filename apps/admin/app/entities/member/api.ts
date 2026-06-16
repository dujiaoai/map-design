import type { AdminUserSummary, PatchUserPayload } from '~/entities/user'
import { buildAdminListQuery, type AdminListQuery } from '~/shared/api/admin-list-query'
import { api } from '~/shared/api/client'

import type { TenantMemberListResponse } from './model'

export function fetchTenantMembers(tenantId: string, params?: AdminListQuery) {
  return api.get<TenantMemberListResponse>(
    `/admin/tenants/${tenantId}/members${buildAdminListQuery(params)}`,
  )
}

export function patchTenantMember(
  tenantId: string,
  userId: string,
  payload: PatchUserPayload,
) {
  return api.patch<AdminUserSummary>(`/admin/tenants/${tenantId}/members/${userId}`, payload)
}

export function updateTenantMemberRoles(
  tenantId: string,
  userId: string,
  roleCodes: string[],
) {
  return api.put<AdminUserSummary>(`/admin/tenants/${tenantId}/members/${userId}/roles`, {
    roleCodes,
  })
}
