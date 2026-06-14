import type { AdminListQuery } from '~/shared/api/admin-api'

export const adminQueryKeys = {
  stats: ['admin', 'stats'] as const,
  tenants: (params?: AdminListQuery) => ['admin', 'tenants', params ?? {}] as const,
  tenantsAll: ['admin', 'tenants', 'all-options'] as const,
  tenant: (tenantId: string) => ['admin', 'tenants', tenantId] as const,
  featureCatalog: ['admin', 'feature-catalog'] as const,
  tenantFeatures: (tenantId: string) => ['admin', 'tenants', tenantId, 'features'] as const,
  users: (tenantId?: string, params?: AdminListQuery) =>
    ['admin', 'users', tenantId ?? 'all', params ?? {}] as const,
  sessionTenants: ['admin', 'session-tenants'] as const,
  roles: ['admin', 'roles'] as const,
  permissions: ['admin', 'permissions'] as const,
  rolePermissions: (roleId: string) => ['admin', 'roles', roleId, 'permissions'] as const,
  members: (tenantId: string) => ['admin', 'members', tenantId] as const,
  tenantCustomRoles: (tenantId: string) => ['admin', 'tenants', tenantId, 'custom-roles'] as const,
  assignableRoles: (tenantId: string) => ['admin', 'tenants', tenantId, 'assignable-roles'] as const,
  tenantRolePermissions: (tenantId: string, roleId: string) =>
    ['admin', 'tenants', tenantId, 'roles', roleId, 'permissions'] as const,
  inviteLinks: (tenantId: string) => ['admin', 'invite-links', tenantId] as const,
  auditLogs: (params?: AdminListQuery) => ['admin', 'audit-logs', params ?? {}] as const,
}
