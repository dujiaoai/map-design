import { api } from './client'

export interface AdminPingResponse {
  status: string
  authenticated: boolean
  platformAdmin: boolean
}

export function fetchAdminPing() {
  return api.get<AdminPingResponse>('/admin/ping')
}

export interface AdminTenantSummary {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  createdAt: number
}

export interface AdminTenantListResponse {
  tenants: AdminTenantSummary[]
}

export function fetchAdminTenants() {
  return api.get<AdminTenantListResponse>('/admin/tenants')
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
}

export interface AdminUserListResponse {
  users: AdminUserSummary[]
}

export function fetchAdminUsers(tenantId?: string) {
  const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : ''
  return api.get<AdminUserListResponse>(`/admin/users${query}`)
}

export interface InviteUserPayload {
  tenantId: string
  email: string
  password: string
  displayName?: string
  roleCode?: 'TENANT_ADMIN' | 'MEMBER' | 'VIEWER'
}

export function inviteAdminUser(payload: InviteUserPayload) {
  return api.post<AdminUserSummary>('/admin/users', payload)
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

export interface InviteTenantMemberPayload {
  email: string
  password: string
  displayName?: string
  roleCode?: 'TENANT_ADMIN' | 'MEMBER' | 'VIEWER'
}

export function inviteTenantMember(tenantId: string, payload: InviteTenantMemberPayload) {
  return api.post<AdminUserSummary>(`/admin/tenants/${tenantId}/members`, payload)
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
