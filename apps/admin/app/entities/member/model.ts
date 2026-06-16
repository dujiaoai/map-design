import type { AdminUserSummary } from '~/entities/user'

export interface TenantMemberListResponse {
  members: AdminUserSummary[]
}

export interface InviteMemberByEmailPayload {
  email: string
  displayName?: string
  roleCode?: string
}
