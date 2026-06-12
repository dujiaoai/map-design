export const adminQueryKeys = {
  stats: ['admin', 'stats'] as const,
  tenants: ['admin', 'tenants'] as const,
  tenant: (tenantId: string) => ['admin', 'tenants', tenantId] as const,
  featureCatalog: ['admin', 'feature-catalog'] as const,
  tenantFeatures: (tenantId: string) => ['admin', 'tenants', tenantId, 'features'] as const,
  users: (tenantId?: string) => ['admin', 'users', tenantId ?? 'all'] as const,
  roles: ['admin', 'roles'] as const,
  permissions: ['admin', 'permissions'] as const,
  rolePermissions: (roleId: string) => ['admin', 'roles', roleId, 'permissions'] as const,
  members: (tenantId: string) => ['admin', 'members', tenantId] as const,
}
