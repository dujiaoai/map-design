export const adminQueryKeys = {
  stats: ['admin', 'stats'] as const,
  tenants: ['admin', 'tenants'] as const,
  users: (tenantId?: string) => ['admin', 'users', tenantId ?? 'all'] as const,
  roles: ['admin', 'roles'] as const,
  permissions: ['admin', 'permissions'] as const,
  rolePermissions: (roleId: string) => ['admin', 'roles', roleId, 'permissions'] as const,
  members: (tenantId: string) => ['admin', 'members', tenantId] as const,
}
