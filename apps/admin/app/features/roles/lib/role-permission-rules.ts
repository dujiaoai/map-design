import type { AdminPermission } from '~/shared/api/admin-api'

const ROLE_ALLOWED_SCOPES: Record<string, AdminPermission['scope'][]> = {
  PLATFORM_ADMIN: ['platform'],
  TENANT_ADMIN: ['tenant', 'workspace'],
  MEMBER: ['workspace'],
  VIEWER: ['workspace'],
}

export function filterPermissionsForRole(
  roleCode: string,
  permissions: AdminPermission[],
): AdminPermission[] {
  const allowed = ROLE_ALLOWED_SCOPES[roleCode] ?? []
  return permissions.filter((permission) => allowed.includes(permission.scope))
}

export const PERMISSION_SCOPE_LABELS: Record<AdminPermission['scope'], string> = {
  platform: '平台',
  tenant: '租户',
  workspace: '工作台',
}
