import { api } from '~/shared/api/client'

import type {
  AssignableRoleListResponse,
  CreateTenantRolePayload,
  TenantRoleListResponse,
  TenantRoleSummary,
} from './model'

export function fetchTenantCustomRoles(tenantId: string) {
  return api.get<TenantRoleListResponse>(`/admin/tenants/${tenantId}/roles`)
}

export function fetchAssignableRoles(tenantId: string) {
  return api.get<AssignableRoleListResponse>(`/admin/tenants/${tenantId}/assignable-roles`)
}

export function createTenantCustomRole(tenantId: string, payload: CreateTenantRolePayload) {
  return api.post<TenantRoleSummary>(`/admin/tenants/${tenantId}/roles`, payload)
}

export function patchTenantCustomRole(
  tenantId: string,
  roleId: string,
  payload: { name?: string; description?: string },
) {
  return api.patch<TenantRoleSummary>(`/admin/tenants/${tenantId}/roles/${roleId}`, payload)
}

export function deleteTenantCustomRole(tenantId: string, roleId: string) {
  return api.delete<void>(`/admin/tenants/${tenantId}/roles/${roleId}`)
}
