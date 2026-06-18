export type TenantOnboardingPhase = 'active' | 'trial' | 'trial_expired' | 'suspended'

export interface AdminTenantSummary {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  trialEndsAt?: number | null
  onboardingPhase?: TenantOnboardingPhase
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

export interface TenantDataExportRequest {
  id: string
  tenantId: string
  status: string
  requestedByUserId: string | null
  artifactUrl: string | null
  createdAt: number | null
  completedAt: number | null
}

export interface TenantDataExportRequestListResponse {
  requests: TenantDataExportRequest[]
}

export interface AdminTenantOidcConfig {
  tenantId: string
  enabled: boolean
  displayName: string | null
  issuerUri: string | null
  clientId: string | null
  configured: boolean
}

export interface PatchTenantOidcConfigPayload {
  enabled?: boolean
  displayName?: string
  issuerUri?: string
  clientId?: string
}

export interface AdminTenantStorageEstimate {
  tenantId: string
  attachmentBytes: number
  mapLayerBytes: number
  totalBytes: number
  source: string
}

export interface TenantMenuOverride {
  id: string
  tenantId: string
  itemId: string
  enabled: boolean | null
  sortOrder: number | null
  title: string | null
}

export interface TenantMenuOverrideListResponse {
  overrides: TenantMenuOverride[]
}
