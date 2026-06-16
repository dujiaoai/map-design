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

export interface AdminRoleSummary {
  id: string
  code: string
  name?: string
  system?: boolean
}

export interface AdminRoleListResponse {
  roles: AdminRoleSummary[]
}

export function fetchAdminRoles() {
  return api.get<AdminRoleListResponse>('/admin/roles')
}

export interface AdminPermission {
  id: string
  code: string
  name: string
  description: string
  scope: 'platform' | 'tenant' | 'workspace'
  moduleId: string | null
  moduleCode: string | null
  moduleName: string | null
  system: boolean
}

export interface AdminPermissionListResponse {
  permissions: AdminPermission[]
}

export function fetchAdminPermissions() {
  return api.get<AdminPermissionListResponse>('/admin/permissions')
}

export interface AdminPermissionModule {
  id: string
  code: string
  name: string
  description: string | null
  scope: 'platform' | 'tenant' | 'workspace'
  system: boolean
  sortOrder: number
  permissions: AdminPermission[]
}

export interface AdminPermissionModuleListResponse {
  modules: AdminPermissionModule[]
}

export function fetchAdminPermissionModules() {
  return api.get<AdminPermissionModuleListResponse>('/admin/permission-modules')
}

export function createAdminPermissionModule(body: {
  code: string
  name: string
  description?: string
  scope: AdminPermissionModule['scope']
  sortOrder?: number
}) {
  return api.post<AdminPermissionModule>('/admin/permission-modules', body)
}

export function patchAdminPermissionModule(
  moduleId: string,
  body: {
    name?: string
    description?: string | null
    scope?: AdminPermissionModule['scope']
    sortOrder?: number
  },
) {
  return api.patch<AdminPermissionModule>(`/admin/permission-modules/${moduleId}`, body)
}

export function deleteAdminPermissionModule(moduleId: string) {
  return api.delete(`/admin/permission-modules/${moduleId}`)
}

export function createAdminPermission(
  moduleId: string,
  body: { action: string; name: string; description?: string },
) {
  return api.post<AdminPermission>(`/admin/permission-modules/${moduleId}/permissions`, body)
}

export function patchAdminPermission(
  permissionId: string,
  body: { name?: string; description?: string | null },
) {
  return api.patch<AdminPermission>(`/admin/permissions/${permissionId}`, body)
}

export function deleteAdminPermission(permissionId: string) {
  return api.delete(`/admin/permissions/${permissionId}`)
}

export interface RolePermissionsResponse {
  roleId: string
  roleCode: string
  permissions: AdminPermission[]
}

export function fetchRolePermissions(roleId: string) {
  return api.get<RolePermissionsResponse>(`/admin/roles/${roleId}/permissions`)
}

export function updateRolePermissions(roleId: string, permissionCodes: string[]) {
  return api.put<RolePermissionsResponse>(`/admin/roles/${roleId}/permissions`, {
    permissionCodes,
  })
}

export interface TenantInviteLinkSummary {
  id: string
  roleCode: string
  label: string | null
  maxUses: number | null
  useCount: number
  expiresAt: number | null
  revokedAt: number | null
  createdAt: number
  status: 'active' | 'expired' | 'revoked' | 'exhausted'
}

export interface TenantInviteLinkListResponse {
  links: TenantInviteLinkSummary[]
}

export interface CreateTenantInviteLinkPayload {
  roleCode?: string
  label?: string
  maxUses?: number
  expiresInHours?: number
}

export interface CreateTenantInviteLinkResponse {
  link: TenantInviteLinkSummary
  inviteUrl: string
}

export function fetchTenantInviteLinks(tenantId: string) {
  return api.get<TenantInviteLinkListResponse>(`/admin/tenants/${tenantId}/invite-links`)
}

export function createTenantInviteLink(
  tenantId: string,
  payload: CreateTenantInviteLinkPayload,
) {
  return api.post<CreateTenantInviteLinkResponse>(`/admin/tenants/${tenantId}/invite-links`, payload)
}

export function revokeTenantInviteLink(tenantId: string, linkId: string) {
  return api.delete<TenantInviteLinkSummary>(
    `/admin/tenants/${tenantId}/invite-links/${linkId}`,
  )
}

export interface TenantRoleSummary {
  id: string
  code: string
  name: string
  description?: string | null
  system: boolean
  permissionCount: number
  memberCount: number
}

export interface TenantRoleListResponse {
  roles: TenantRoleSummary[]
}

export interface AssignableRoleSummary {
  id: string
  code: string
  name: string
  system: boolean
}

export interface AssignableRoleListResponse {
  roles: AssignableRoleSummary[]
}

export function fetchTenantAssignablePermissions(tenantId: string) {
  return api.get<AdminPermissionListResponse>(`/admin/tenants/${tenantId}/assignable-permissions`)
}

export function fetchTenantCustomRoles(tenantId: string) {
  return api.get<TenantRoleListResponse>(`/admin/tenants/${tenantId}/roles`)
}

export function fetchAssignableRoles(tenantId: string) {
  return api.get<AssignableRoleListResponse>(`/admin/tenants/${tenantId}/assignable-roles`)
}

export interface CreateTenantRolePayload {
  code: string
  name: string
  description?: string
  permissionCodes?: string[]
}

export function createTenantCustomRole(tenantId: string, payload: CreateTenantRolePayload) {
  return api.post<TenantRoleSummary>(`/admin/tenants/${tenantId}/roles`, payload)
}

export function patchTenantCustomRole(
  tenantId: string,
  roleId: string,
  payload: { name?: string; description?: string },
) {
  return api.patch<TenantRoleSummary>(`/admin/tenants/${tenantId}/roles/${roleId}`, payload)
}

export function deleteTenantCustomRole(tenantId: string, roleId: string) {
  return api.delete<void>(`/admin/tenants/${tenantId}/roles/${roleId}`)
}

export function fetchTenantRolePermissions(tenantId: string, roleId: string) {
  return api.get<RolePermissionsResponse>(`/admin/tenants/${tenantId}/roles/${roleId}/permissions`)
}

export function updateTenantRolePermissions(
  tenantId: string,
  roleId: string,
  permissionCodes: string[],
) {
  return api.put<RolePermissionsResponse>(
    `/admin/tenants/${tenantId}/roles/${roleId}/permissions`,
    { permissionCodes },
  )
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
