import type { AdminPermission } from '~/entities/permission'

export interface AdminRoleSummary {
  id: string
  code: string
  name?: string
  system?: boolean
}

export interface AdminRoleListResponse {
  roles: AdminRoleSummary[]
}

export interface RolePermissionsResponse {
  roleId: string
  roleCode: string
  permissions: AdminPermission[]
}
