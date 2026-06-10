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

export function fetchAdminUsers() {
  return api.get<AdminUserListResponse>('/admin/users')
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
