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

export interface PatchUserPayload {
  displayName?: string
  status?: 'active' | 'disabled'
}

export interface UserOauthBindItem {
  providerId: string
  providerDisplayName: string
  emailSnapshot: string | null
  createdAt: string
  lastUsedAt: string
}

export interface UserOauthBindsResponse {
  binds: UserOauthBindItem[]
}
