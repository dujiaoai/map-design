export interface AdminTenantSummary {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  trialEndsAt?: number | null
  createdAt: number
}

export interface AdminTenantListResponse {
  tenants: AdminTenantSummary[]
  total?: number
  page?: number
  size?: number
}

export interface CreateTenantPayload {
  name: string
  slug: string
  plan?: string
  trialEndsAt?: number
}

export interface PatchTenantPayload {
  name?: string
  plan?: string
  status?: 'active' | 'suspended'
  trialEndsAt?: number
  clearTrialEndsAt?: boolean
}

export interface FeatureCatalogEntry {
  code: string
  name: string
  description: string
}

export interface FeatureCatalogResponse {
  features: FeatureCatalogEntry[]
}

export interface AdminTenantFeaturesResponse {
  tenantId: string
  featureCodes: string[]
}

export interface TenantQuotasResponse {
  tenantId: string
  plan: string
  seats: { limit: number | null; used: number }
  apiRate: { limitPerMinute: number }
  storage: { limitBytes: number; usedBytes: number }
}
