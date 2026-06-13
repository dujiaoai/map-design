import { sessionSchema, type Session } from '@repo/auth'

import { api } from './client'

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

export interface AdminTenantSummary {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  createdAt: number
}

export interface AdminListQuery {
  q?: string
  page?: number
  size?: number
  status?: 'active' | 'disabled' | 'invited'
  action?: string
  crossTenant?: boolean
}

export interface AdminTenantListResponse {
  tenants: AdminTenantSummary[]
  total?: number
  page?: number
  size?: number
}

function buildAdminListQuery(params?: AdminListQuery) {
  const search = new URLSearchParams()
  if (params?.q) search.set('q', params.q)
  if (params?.page != null) search.set('page', String(params.page))
  if (params?.size != null) search.set('size', String(params.size))
  if (params?.status) search.set('status', params.status)
  if (params?.action) search.set('action', params.action)
  if (params?.crossTenant != null) search.set('crossTenant', String(params.crossTenant))
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function fetchAdminTenants(params?: AdminListQuery) {
  return api.get<AdminTenantListResponse>(`/admin/tenants${buildAdminListQuery(params)}`)
}

export function fetchAdminTenant(tenantId: string) {
  return api.get<AdminTenantSummary>(`/admin/tenants/${tenantId}`)
}

export interface CreateTenantPayload {
  name: string
  slug: string
  plan?: string
}

export function createAdminTenant(payload: CreateTenantPayload) {
  return api.post<AdminTenantSummary>('/admin/tenants', payload)
}

export interface PatchTenantPayload {
  name?: string
  plan?: string
  status?: 'active' | 'suspended'
}

export function patchAdminTenant(tenantId: string, payload: PatchTenantPayload) {
  return api.patch<AdminTenantSummary>(`/admin/tenants/${tenantId}`, payload)
}

export interface FeatureCatalogEntry {
  code: string
  name: string
  description: string
}

export interface FeatureCatalogResponse {
  features: FeatureCatalogEntry[]
}

export function fetchFeatureCatalog() {
  return api.get<FeatureCatalogResponse>('/admin/feature-catalog')
}

export interface AdminTenantFeaturesResponse {
  tenantId: string
  featureCodes: string[]
}

export function fetchTenantFeatures(tenantId: string) {
  return api.get<AdminTenantFeaturesResponse>(`/admin/tenants/${tenantId}/features`)
}

export function updateTenantFeatures(tenantId: string, featureCodes: string[]) {
  return api.put<AdminTenantFeaturesResponse>(`/admin/tenants/${tenantId}/features`, {
    featureCodes,
  })
}

export interface AdminUserSummary {
  id: string
  email: string
  displayName: string
  status: string
  tenantId: string
  tenantSlug: string
  tenantName: string
  roles: string[]
  createdAt: number
  lastLoginAt?: number | null
}

export interface AdminUserListResponse {
  users: AdminUserSummary[]
  total?: number
  page?: number
  size?: number
}

export function fetchAdminUsers(tenantId?: string, params?: AdminListQuery) {
  const search = new URLSearchParams()
  if (tenantId) search.set('tenantId', tenantId)
  if (params?.q) search.set('q', params.q)
  if (params?.page != null) search.set('page', String(params.page))
  if (params?.size != null) search.set('size', String(params.size))
  if (params?.status) search.set('status', params.status)
  const query = search.toString()
  return api.get<AdminUserListResponse>(`/admin/users${query ? `?${query}` : ''}`)
}

export interface PatchUserPayload {
  displayName?: string
  status?: 'active' | 'disabled'
}

export function patchAdminUser(userId: string, payload: PatchUserPayload) {
  return api.patch<AdminUserSummary>(`/admin/users/${userId}`, payload)
}

export interface AdminRoleSummary {
  id: string
  code: string
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
}

export interface AdminPermissionListResponse {
  permissions: AdminPermission[]
}

export function fetchAdminPermissions() {
  return api.get<AdminPermissionListResponse>('/admin/permissions')
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

export interface TenantMemberListResponse {
  members: AdminUserSummary[]
}

export function fetchTenantMembers(tenantId: string) {
  return api.get<TenantMemberListResponse>(`/admin/tenants/${tenantId}/members`)
}

export interface TenantInviteLinkSummary {
  id: string
  roleCode: 'TENANT_ADMIN' | 'MEMBER' | 'VIEWER'
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
  roleCode?: 'TENANT_ADMIN' | 'MEMBER' | 'VIEWER'
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

export function patchTenantMember(
  tenantId: string,
  userId: string,
  payload: PatchUserPayload,
) {
  return api.patch<AdminUserSummary>(`/admin/tenants/${tenantId}/members/${userId}`, payload)
}

export function updateTenantMemberRoles(
  tenantId: string,
  userId: string,
  roleCodes: string[],
) {
  return api.put<AdminUserSummary>(`/admin/tenants/${tenantId}/members/${userId}/roles`, {
    roleCodes,
  })
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

export interface AdminAuditLogEntry {
  id: string
  actorEmail: string
  action: string
  resourceType: string
  resourceId: string | null
  targetTenantId: string | null
  crossTenant: boolean
  detail: string | null
  createdAt: number
}

export interface AdminAuditLogListResponse {
  logs: AdminAuditLogEntry[]
  total?: number
  page?: number
  size?: number
}

export function fetchAdminAuditLogs(params?: AdminListQuery) {
  return api.get<AdminAuditLogListResponse>(`/admin/audit-logs${buildAdminListQuery(params)}`)
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
