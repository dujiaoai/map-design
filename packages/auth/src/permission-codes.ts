import { SaaSRole } from './types'

/** 与 saas-api V6__permissions.sql / PermissionCodes.java 对齐 */
export const PermissionCodes = {
  ADMIN_TENANTS_READ: 'admin:tenants:read',
  ADMIN_TENANTS_WRITE: 'admin:tenants:write',
  ADMIN_USERS_READ: 'admin:users:read',
  ADMIN_USERS_WRITE: 'admin:users:write',
  ADMIN_ROLES_READ: 'admin:roles:read',
  ADMIN_ROLES_WRITE: 'admin:roles:write',
  ADMIN_MEMBERS_READ: 'admin:members:read',
  ADMIN_MEMBERS_WRITE: 'admin:members:write',
  WORKSPACE_USE: 'workspace:use',
  WORKSPACE_MAP_READ: 'workspace:map:read',
  WORKSPACE_MAP_WRITE: 'workspace:map:write',
  BILLING_WALLET_READ: 'billing:wallet:read',
  BILLING_LEDGER_READ: 'billing:ledger:read',
  BILLING_RECHARGE_CREATE: 'billing:recharge:create',
  BILLING_USAGE_READ: 'billing:usage:read',
  ADMIN_BILLING_READ: 'admin:billing:read',
  ADMIN_BILLING_ADJUST: 'admin:billing:adjust',
  ADMIN_BILLING_PACKAGES_WRITE: 'admin:billing:packages:write',
} as const

export type PermissionCode = (typeof PermissionCodes)[keyof typeof PermissionCodes]

/** 种子角色默认权限（联调 / mock；运行时以 JWT / users/me 为准） */
export const ROLE_DEFAULT_PERMISSIONS = {
  [SaaSRole.PLATFORM_ADMIN]: [
    PermissionCodes.ADMIN_TENANTS_READ,
    PermissionCodes.ADMIN_TENANTS_WRITE,
    PermissionCodes.ADMIN_USERS_READ,
    PermissionCodes.ADMIN_USERS_WRITE,
    PermissionCodes.ADMIN_ROLES_READ,
    PermissionCodes.ADMIN_ROLES_WRITE,
    PermissionCodes.ADMIN_MEMBERS_READ,
    PermissionCodes.ADMIN_MEMBERS_WRITE,
    PermissionCodes.ADMIN_BILLING_READ,
    PermissionCodes.ADMIN_BILLING_ADJUST,
    PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE,
  ],
  [SaaSRole.TENANT_ADMIN]: [
    PermissionCodes.ADMIN_MEMBERS_READ,
    PermissionCodes.ADMIN_MEMBERS_WRITE,
    PermissionCodes.WORKSPACE_USE,
    PermissionCodes.WORKSPACE_MAP_READ,
    PermissionCodes.WORKSPACE_MAP_WRITE,
    PermissionCodes.BILLING_WALLET_READ,
    PermissionCodes.BILLING_LEDGER_READ,
    PermissionCodes.BILLING_RECHARGE_CREATE,
    PermissionCodes.BILLING_USAGE_READ,
  ],
  [SaaSRole.MEMBER]: [
    PermissionCodes.WORKSPACE_USE,
    PermissionCodes.WORKSPACE_MAP_READ,
    PermissionCodes.WORKSPACE_MAP_WRITE,
    PermissionCodes.BILLING_WALLET_READ,
    PermissionCodes.BILLING_LEDGER_READ,
    PermissionCodes.BILLING_RECHARGE_CREATE,
  ],
  [SaaSRole.VIEWER]: [
    PermissionCodes.WORKSPACE_USE,
    PermissionCodes.WORKSPACE_MAP_READ,
    PermissionCodes.BILLING_WALLET_READ,
    PermissionCodes.BILLING_LEDGER_READ,
  ],
} as const satisfies Record<SaaSRole, readonly PermissionCode[]>
