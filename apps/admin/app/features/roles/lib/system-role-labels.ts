import { SaaSRole } from '@repo/auth'

import { formatMemberRoleLabel } from '~/features/members/lib/member-role-labels'
import type { AdminPermission } from '~/shared/api/admin-api'

export type SystemRoleScope = AdminPermission['scope']

export const SYSTEM_ROLE_SCOPE: Record<string, SystemRoleScope> = {
  [SaaSRole.PLATFORM_ADMIN]: 'platform',
  [SaaSRole.TENANT_ADMIN]: 'tenant',
  [SaaSRole.MEMBER]: 'workspace',
  [SaaSRole.VIEWER]: 'workspace',
}

export const SYSTEM_ROLE_SCOPE_LABELS: Record<SystemRoleScope, string> = {
  platform: '平台级',
  tenant: '租户级',
  workspace: '工作台',
}

export const SYSTEM_ROLE_HINTS: Record<string, string> = {
  [SaaSRole.PLATFORM_ADMIN]: '运营后台全平台权限；可跨租户管理与配置系统角色。',
  [SaaSRole.TENANT_ADMIN]: '单租户管理权限；可管理成员、自定义角色与租户设置。',
  [SaaSRole.MEMBER]: '工作台标准使用权限；不可管理租户或平台配置。',
  [SaaSRole.VIEWER]: '只读访问工作台；不可修改地图与业务数据。',
}

export function formatSystemRoleLabel(code: string, name?: string | null): string {
  if (name?.trim()) return name.trim()
  if (code === SaaSRole.PLATFORM_ADMIN) return '平台管理员'
  return formatMemberRoleLabel(code)
}

export function describeSystemRole(code: string): string {
  return SYSTEM_ROLE_HINTS[code] ?? `系统内置角色 ${code}`
}

export function getSystemRoleScope(code: string): SystemRoleScope | null {
  return SYSTEM_ROLE_SCOPE[code] ?? null
}

export function systemRoleInitials(code: string, name?: string | null): string {
  const label = formatSystemRoleLabel(code, name)
  if (label.length >= 2) return label.slice(0, 2)
  return code.slice(0, 2).toUpperCase()
}
