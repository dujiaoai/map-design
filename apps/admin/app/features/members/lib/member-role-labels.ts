export const TENANT_MEMBER_ROLES = ['TENANT_ADMIN', 'MEMBER', 'VIEWER'] as const

export type TenantMemberRole = (typeof TENANT_MEMBER_ROLES)[number]

export const TENANT_MEMBER_ROLE_LABELS: Record<TenantMemberRole, string> = {
  TENANT_ADMIN: '租户管理员',
  MEMBER: '成员',
  VIEWER: '只读查看者',
}

export function formatMemberRoleLabel(roleCode: string, roleName?: string | null): string {
  if (roleName) return roleName
  return TENANT_MEMBER_ROLE_LABELS[roleCode as TenantMemberRole] ?? roleCode
}

export const INVITE_LINK_STATUS_LABELS = {
  active: '有效',
  expired: '已过期',
  revoked: '已撤销',
  exhausted: '已用尽',
} as const

export function formatInviteLinkExpiry(expiresAt: number | null) {
  if (expiresAt == null) return '永不过期'
  return new Date(expiresAt).toLocaleString('zh-CN')
}

export function formatInviteLinkUses(useCount: number, maxUses: number | null) {
  if (maxUses == null) return `${useCount} 次（不限）`
  return `${useCount} / ${maxUses}`
}

export const MEMBER_ROLE_HINTS: Partial<Record<TenantMemberRole, string>> = {
  TENANT_ADMIN: '可管理成员、设置与邀请',
  MEMBER: '可使用租户内标准功能',
  VIEWER: '只读访问，不可修改数据',
}

export function describeMemberRole(role: { code: string; name: string }): string {
  return (
    MEMBER_ROLE_HINTS[role.code as TenantMemberRole] ??
    (role.name ? `${role.name}（${role.code}）` : role.code)
  )
}

export function memberInitials(displayName: string, email: string): string {
  const name = displayName.trim()
  if (name.length >= 2) return name.slice(0, 2).toUpperCase()
  if (name.length === 1) return name.toUpperCase()
  const local = email.split('@')[0]?.trim() ?? ''
  if (local.length >= 2) return local.slice(0, 2).toUpperCase()
  return local.slice(0, 1).toUpperCase() || '?'
}
