import { SaaSRole } from '@repo/auth'

import { formatMemberRoleLabel } from '~/features/members/lib/member-role-labels'

export const PLATFORM_ADMIN_LABEL = '平台管理员'

export const PLATFORM_ADMIN_HINT =
  '可访问运营后台与跨租户管理能力；租户内角色请在「成员」页分配。'

export function formatUserRoleLabel(role: string): string {
  if (role === SaaSRole.PLATFORM_ADMIN) return PLATFORM_ADMIN_LABEL
  return formatMemberRoleLabel(role)
}

export function isPlatformAdminRole(roles: string[]): boolean {
  return roles.includes(SaaSRole.PLATFORM_ADMIN)
}
