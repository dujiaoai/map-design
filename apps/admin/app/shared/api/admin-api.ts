import { sessionSchema, type Session } from '@repo/auth'

import type { AdminUserSummary, PatchUserPayload } from '~/entities/user'

import { api } from './client'
import { buildAdminListQuery, type AdminListQuery } from './admin-list-query'

export type { AdminListQuery } from './admin-list-query'
export { buildAdminListQuery } from './admin-list-query'
export type { AdminAuditLogEntry, AdminAuditLogListResponse } from '~/entities/audit-log'
export { fetchAdminAuditLogs } from '~/entities/audit-log'
export type { TenantMemberListResponse } from '~/entities/member'
export {
  fetchTenantMembers,
  patchTenantMember,
  updateTenantMemberRoles,
} from '~/entities/member'
export type {
  AdminPermission,
  AdminPermissionListResponse,
  AdminPermissionModule,
  AdminPermissionModuleListResponse,
} from '~/entities/permission'
export {
  createAdminPermission,
  createAdminPermissionModule,
  deleteAdminPermission,
  deleteAdminPermissionModule,
  fetchAdminPermissionModules,
  fetchAdminPermissions,
  fetchTenantAssignablePermissions,
  patchAdminPermission,
  patchAdminPermissionModule,
} from '~/entities/permission'
export type {
  AdminRoleListResponse,
  AdminRoleSummary,
  RolePermissionsResponse,
} from '~/entities/role'
export {
  fetchAdminRoles,
  fetchRolePermissions,
  fetchTenantRolePermissions,
  updateRolePermissions,
  updateTenantRolePermissions,
} from '~/entities/role'
export type {
  CreateTenantInviteLinkPayload,
  CreateTenantInviteLinkResponse,
  TenantInviteLinkListResponse,
  TenantInviteLinkSummary,
} from '~/entities/invite-link'
export {
  createTenantInviteLink,
  fetchTenantInviteLinks,
  revokeTenantInviteLink,
} from '~/entities/invite-link'
export type {
  AssignableRoleListResponse,
  AssignableRoleSummary,
  CreateTenantRolePayload,
  TenantRoleListResponse,
  TenantRoleSummary,
} from '~/entities/tenant-role'
export {
  createTenantCustomRole,
  deleteTenantCustomRole,
  fetchAssignableRoles,
  fetchTenantCustomRoles,
  patchTenantCustomRole,
} from '~/entities/tenant-role'
export type {
  AdminTenantFeaturesResponse,
  AdminTenantListResponse,
  AdminTenantSummary,
  CreateTenantPayload,
  FeatureCatalogEntry,
  FeatureCatalogResponse,
  PatchTenantPayload,
  TenantQuotasResponse,
} from '~/entities/tenant'
export {
  createAdminTenant,
  fetchAdminTenant,
  fetchAdminTenants,
  fetchFeatureCatalog,
  fetchTenantFeatures,
  fetchTenantQuotas,
  patchAdminTenant,
  updateTenantFeatures,
} from '~/entities/tenant'
export type { AdminUserListResponse, AdminUserSummary, PatchUserPayload } from '~/entities/user'
export {
  fetchAdminUserOauthBinds,
  fetchAdminUsers,
  patchAdminUser,
  unbindAdminUserOauthProvider,
  updateAdminUserRoles,
} from '~/entities/user'

export type { UserOauthBindItem, UserOauthBindsResponse } from './oauth-binds'

export interface AdminPingResponse {
  status: string
  authenticated: boolean
  platformAdmin: boolean
}

export function fetchAdminPing() {
  return api.get<AdminPingResponse>('/admin/ping')
}

export interface AdminStatsResponse {
  tenantCount: number
  userCount: number
  activeTenantCount: number
}

export function fetchAdminStats() {
  return api.get<AdminStatsResponse>('/admin/stats')
}

export interface AdminSystemFlagsResponse {
  registration: {
    allowPublicOrgSignup: boolean
    allowPublicPersonalSignup: boolean
    registrationTokenTtl: string
  }
  auth: {
    passwordStrengthEnabled: boolean
  }
  mail: {
    enabled: boolean
    fromAddress: string
    outboundReady: boolean
  }
  rateLimit: {
    enabled: boolean
    loginIpMaxAttempts: number
    loginAccountMaxAttempts: number
  }
  tenantRls: {
    enabled: boolean
  }
  billing: {
    integrationEnabled: boolean
    baseUrl: string
    membershipPushEnabled: boolean
  }
  mfa: {
    enforcementEnabled: boolean
    totpEnrollmentAvailable: boolean
    enrolledPlatformAdminCount: number
  }
  oidc: {
    enabled: boolean
    authorizationCodeFlowAvailable: boolean
    configuredProviderCount: number
  }
  runtime: {
    activeProfiles: string[]
    jwtPermEpoch: number
  }
}

export interface AdminMfaStatusResponse {
  enforcementEnabled: boolean
  totpEnrollmentAvailable: boolean
  enrolled: boolean
  verifiedAt: number | null
  recoveryCodesRemaining: number
  recoveryCodes?: string[] | null
}

export function fetchAdminMfaStatus() {
  return api.get<AdminMfaStatusResponse>('/admin/mfa/status')
}

export interface TotpEnrollResponse {
  secret: string
  otpauthUri: string
  qrCodeDataUrl: string
}

export function enrollAdminTotp() {
  return api.post<TotpEnrollResponse>('/admin/mfa/totp/enroll')
}

export function verifyAdminTotp(code: string) {
  return api.post<AdminMfaStatusResponse>('/admin/mfa/totp/verify', { code })
}

export function disableAdminTotp(code: string) {
  return api.request<AdminMfaStatusResponse>('/admin/mfa/totp', {
    method: 'DELETE',
    body: { code },
  })
}

export function regenerateAdminRecoveryCodes(code: string) {
  return api.post<AdminMfaStatusResponse>('/admin/mfa/recovery-codes/regenerate', { code })
}

export interface OidcProvidersResponse {
  enabled: boolean
  authorizationCodeFlowAvailable: boolean
  providers: Array<{ id: string; displayName: string }>
}

export interface OidcAuthorizeResponse {
  authorizationUrl: string
  state: string
}

export function fetchOidcProviders() {
  return api.get<OidcProvidersResponse>('/auth/oidc/providers')
}

export function startOidcAuthorize(providerId: string, tenantId: string) {
  const params = new URLSearchParams({ client: 'admin', tenantId: tenantId.trim() })
  return api.get<OidcAuthorizeResponse>(
    `/auth/oidc/${encodeURIComponent(providerId)}/authorize?${params.toString()}`,
  )
}

export function fetchAdminSystemFlags() {
  return api.get<AdminSystemFlagsResponse>('/admin/system/flags')
}

export interface SessionTenantSummary {
  id: string
  name: string
  slug: string
  plan: string
  current: boolean
}

export interface SessionTenantListResponse {
  items: SessionTenantSummary[]
}

export function fetchSessionTenants() {
  return api.get<SessionTenantListResponse>('/tenants')
}

export async function updateAccountProfile(values: {
  name: string
  phone?: string | null
  avatarUrl?: string | null
}) {
  const session = sessionSchema.parse(
    await api.put<Session>('/users/me', {
      name: values.name,
      phone: values.phone ?? null,
      avatarUrl: values.avatarUrl ?? null,
    }),
  )
  return session
}

export function updateAccountPassword(oldPassword: string, newPassword: string) {
  return api.post('/users/me/password', { oldPassword, newPassword })
}

export function startImpersonation(body: { tenantId: string; reason: string; totpCode?: string }) {
  return api.post('/admin/impersonation', body)
}

export function stopImpersonation() {
  return api.delete('/admin/impersonation')
}
