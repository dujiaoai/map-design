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
