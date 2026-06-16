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
