import { buildAdminListQuery, type AdminListQuery } from '~/shared/api/admin-list-query'
import { api } from '~/shared/api/client'

import type {
  AdminUserListResponse,
  AdminUserSummary,
  PatchUserPayload,
  UserOauthBindsResponse,
} from './model'

export function fetchAdminUsers(tenantId?: string, params?: AdminListQuery) {
  const queryParams = tenantId ? { ...params, tenantId } : params
  return api.get<AdminUserListResponse>(`/admin/users${buildAdminListQuery(queryParams)}`)
}

export function patchAdminUser(userId: string, payload: PatchUserPayload) {
  return api.patch<AdminUserSummary>(`/admin/users/${userId}`, payload)
}

export function updateAdminUserRoles(userId: string, roleCodes: string[]) {
  return api.put<AdminUserSummary>(`/admin/users/${userId}/roles`, { roleCodes })
}

export function fetchAdminUserOauthBinds(userId: string) {
  return api.get<UserOauthBindsResponse>(`/admin/users/${userId}/oauth-binds`)
}

export function unbindAdminUserOauthProvider(userId: string, providerId: string) {
  return api.delete<void>(
    `/admin/users/${userId}/oauth-binds/${encodeURIComponent(providerId)}`,
  )
}
