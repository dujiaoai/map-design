import { api } from '~/shared/api/client'

import type { AdminRoleListResponse, RolePermissionsResponse } from './model'

export function fetchAdminRoles() {
  return api.get<AdminRoleListResponse>('/admin/roles')
}

export function fetchRolePermissions(roleId: string) {
  return api.get<RolePermissionsResponse>(`/admin/roles/${roleId}/permissions`)
}

export function updateRolePermissions(roleId: string, permissionCodes: string[]) {
  return api.put<RolePermissionsResponse>(`/admin/roles/${roleId}/permissions`, {
    permissionCodes,
  })
}

export function fetchTenantRolePermissions(tenantId: string, roleId: string) {
  return api.get<RolePermissionsResponse>(`/admin/tenants/${tenantId}/roles/${roleId}/permissions`)
}

export function updateTenantRolePermissions(
  tenantId: string,
  roleId: string,
  permissionCodes: string[],
) {
  return api.put<RolePermissionsResponse>(
    `/admin/tenants/${tenantId}/roles/${roleId}/permissions`,
    { permissionCodes },
  )
}
