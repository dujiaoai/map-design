import type { AdminListQuery } from '~/shared/lib/admin-list-query'

export const adminQueryKeys = {
  stats: ['admin', 'stats'] as const,
  ping: ['admin', 'ping'] as const,
  tenants: (params?: AdminListQuery) => ['admin', 'tenants', params ?? {}] as const,
  tenantsAll: ['admin', 'tenants', 'all-options'] as const,
  tenant: (tenantId: string) => ['admin', 'tenants', tenantId] as const,
  featureCatalog: ['admin', 'feature-catalog'] as const,
  tenantFeatures: (tenantId: string) => ['admin', 'tenants', tenantId, 'features'] as const,
  tenantQuotas: (tenantId: string) => ['admin', 'tenants', tenantId, 'quotas'] as const,
  tenantDataExports: (tenantId: string) => ['admin', 'tenants', tenantId, 'data-exports'] as const,
  tenantOidcConfig: (tenantId: string) => ['admin', 'tenants', tenantId, 'oidc-config'] as const,
  tenantSamlConfig: (tenantId: string) => ['admin', 'tenants', tenantId, 'saml-config'] as const,
  tenantSamlIdpRegistrations: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'saml-idp-registrations'] as const,
  tenantSamlIdpFederation: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'saml-idp-federation'] as const,
  tenantSamlIdpHealth: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'saml-idp-health'] as const,
  tenantScimProvisioning: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'scim-provisioning'] as const,
  tenantScimSyncEvents: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'scim-sync-events'] as const,
  tenantScimChangePreview: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'scim-change-preview'] as const,
  tenantStorageEstimate: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'storage-estimate'] as const,
  tenantMenuOverrides: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'menu-overrides'] as const,
  tenantMenuDiff: (tenantId: string) => ['admin', 'tenants', tenantId, 'menu-diff'] as const,
  users: (tenantId?: string, params?: AdminListQuery) =>
    ['admin', 'users', tenantId ?? 'all', params ?? {}] as const,
  sessionTenants: ['admin', 'session-tenants'] as const,
  roles: ['admin', 'roles'] as const,
  permissions: ['admin', 'permissions'] as const,
  permissionModules: ['admin', 'permission-modules'] as const,
  rolePermissions: (roleId: string) => ['admin', 'roles', roleId, 'permissions'] as const,
  members: (tenantId: string, params?: AdminListQuery) =>
    ['admin', 'members', tenantId, params ?? {}] as const,
  membersRoot: (tenantId: string) => ['admin', 'members', tenantId] as const,
  tenantCustomRoles: (tenantId: string) => ['admin', 'tenants', tenantId, 'custom-roles'] as const,
  tenantAssignablePermissions: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'assignable-permissions'] as const,
  assignableRoles: (tenantId: string) => ['admin', 'tenants', tenantId, 'assignable-roles'] as const,
  tenantRolePermissions: (tenantId: string, roleId: string) =>
    ['admin', 'tenants', tenantId, 'roles', roleId, 'permissions'] as const,
  inviteLinks: (tenantId: string) => ['admin', 'invite-links', tenantId] as const,
  auditLogs: (params?: AdminListQuery) => ['admin', 'audit-logs', params ?? {}] as const,
  auditLog: (logId: string) => ['admin', 'audit-logs', logId] as const,
  products: ['admin', 'products'] as const,
  product: (code: string) => ['admin', 'products', code] as const,
  productFeatures: (code: string) => ['admin', 'products', code, 'features'] as const,
  navigation: (productCode?: string) => ['admin', 'navigation', productCode ?? 'default'] as const,
  auditWebhookConfig: ['admin', 'audit-webhook-config'] as const,
  auditWebhookDeadLetters: (params?: AdminListQuery) =>
    ['admin', 'audit-webhook-dead-letters', params ?? {}] as const,
  auditWebhookSla: ['admin', 'audit-webhook-sla'] as const,
  auditWebhookSelfHeal: ['admin', 'audit-webhook-self-heal'] as const,
  auditWebhookArchiveSummary: ['admin', 'audit-webhook-archive-summary'] as const,
  finOps: ['admin', 'finops'] as const,
  finOpsBudget: ['admin', 'finops-budget'] as const,
  auditWebhookTargets: ['admin', 'audit-webhook-targets'] as const,
  usageTrends: ['admin', 'usage-trends'] as const,
  usageAnomalies: ['admin', 'usage-anomalies'] as const,
  usageForecast: ['admin', 'usage-forecast'] as const,
  tenantScimGroupMappingRules: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'scim-group-mapping-rules'] as const,
  tenantScimSchemaExtension: (tenantId: string) =>
    ['admin', 'tenants', tenantId, 'scim-schema-extension'] as const,
  systemFlags: ['admin', 'system-flags'] as const,
  systemDependencies: ['admin', 'system-dependencies'] as const,
  mfaStatus: ['admin', 'mfa-status'] as const,
  menus: ['admin', 'menus'] as const,
}
