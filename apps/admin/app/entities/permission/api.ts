import { api } from '~/shared/api/client'

import type {
  AdminPermission,
  AdminPermissionListResponse,
  AdminPermissionModule,
  AdminPermissionModuleListResponse,
} from './model'

export function fetchAdminPermissions() {
  return api.get<AdminPermissionListResponse>('/admin/permissions')
}

export function fetchAdminPermissionModules() {
  return api.get<AdminPermissionModuleListResponse>('/admin/permission-modules')
}

export function createAdminPermissionModule(body: {
  code: string
  name: string
  description?: string
  scope: AdminPermissionModule['scope']
  sortOrder?: number
}) {
  return api.post<AdminPermissionModule>('/admin/permission-modules', body)
}

export function patchAdminPermissionModule(
  moduleId: string,
  body: {
    name?: string
    description?: string | null
    scope?: AdminPermissionModule['scope']
    sortOrder?: number
  },
) {
  return api.patch<AdminPermissionModule>(`/admin/permission-modules/${moduleId}`, body)
}

export function deleteAdminPermissionModule(moduleId: string) {
  return api.delete(`/admin/permission-modules/${moduleId}`)
}

export function createAdminPermission(
  moduleId: string,
  body: { action: string; name: string; description?: string },
) {
  return api.post<AdminPermission>(`/admin/permission-modules/${moduleId}/permissions`, body)
}

export function patchAdminPermission(
  permissionId: string,
  body: { name?: string; description?: string | null },
) {
  return api.patch<AdminPermission>(`/admin/permissions/${permissionId}`, body)
}

export function deleteAdminPermission(permissionId: string) {
  return api.delete(`/admin/permissions/${permissionId}`)
}

export function fetchTenantAssignablePermissions(tenantId: string) {
  return api.get<AdminPermissionListResponse>(`/admin/tenants/${tenantId}/assignable-permissions`)
}
