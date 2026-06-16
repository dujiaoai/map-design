import type { AdminUserSummary } from '~/entities/user'

export interface TenantMemberListResponse {
  members: AdminUserSummary[]
}
