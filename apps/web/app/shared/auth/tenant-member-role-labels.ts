export const TENANT_MEMBER_ROLES = ['TENANT_ADMIN', 'MEMBER', 'VIEWER'] as const

export type TenantMemberRole = (typeof TENANT_MEMBER_ROLES)[number]

export const TENANT_MEMBER_ROLE_LABELS: Record<TenantMemberRole, string> = {
  TENANT_ADMIN: '租户管理员',
  MEMBER: '成员',
  VIEWER: '只读查看者',
}

export function formatTenantMemberRoleLabel(roleCode: string): string {
  return TENANT_MEMBER_ROLE_LABELS[roleCode as TenantMemberRole] ?? roleCode
}
