export type TenantOnboardingPhase = 'active' | 'trial' | 'trial_expired' | 'suspended'

export interface AdminTenantSummary {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  trialEndsAt?: number | null
  onboardingPhase?: TenantOnboardingPhase
  productCode?: string
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
  clientSecretConfigured: boolean
  scopes: string | null
  expectedCallbackUrl: string | null
  metadataImported: boolean
  metadataImportedAt: number | null
}

export interface AdminTenantSamlConfig {
  tenantId: string
  enabled: boolean
  entityId: string | null
  ssoUrl: string | null
  acsUrl: string | null
  spEntityId: string | null
  certificateConfigured: boolean
  metadataUrl: string | null
  spCertificateConfigured: boolean
  spCertificateExpiresAt: number | null
  idpCertExpiresAt: number | null
  metadataSyncEnabled: boolean
  lastMetadataSyncAt: number | null
  configured: boolean
}

export interface PatchTenantSamlConfigPayload {
  enabled?: boolean
  entityId?: string
  ssoUrl?: string
  acsUrl?: string
  spEntityId?: string
  certificatePem?: string
  metadataUrl?: string
  metadataSyncEnabled?: boolean
}

export interface TenantSamlMetadataImportResponse {
  tenantId: string
  entityId: string
  ssoUrl: string
  certificateImported: boolean
  importedAt: number
}

export interface TenantSamlSpCertificateRotateResponse {
  tenantId: string
  spCertificateExpiresAt: number
}

export interface AdminScimGroupMappingRule {
  id: string
  externalGroupPattern: string
  tenantRoleId: string
  roleName: string
  priority: number
  createdAt: number
}

export interface AdminScimGroupMappingRuleListResponse {
  tenantId: string
  rules: AdminScimGroupMappingRule[]
}

export interface AdminTenantSamlIdpRegistration {
  id: string
  idpEntityId: string | null
  status: string
  createdAt: number
}

export interface AdminTenantSamlIdpRegistrationListResponse {
  registrations: AdminTenantSamlIdpRegistration[]
}

export interface AdminTenantSamlIdpApproveResponse {
  registrationId: string
  status: string
}

export interface TenantSamlIdpFederation {
  id: string
  tenantId: string
  idpEntityId: string
  ssoUrl: string
  hasCertificate: boolean
  priority: number
  enabled: boolean
  createdAt: number
  updatedAt: number
}

export interface TenantSamlIdpFederationListResponse {
  items: TenantSamlIdpFederation[]
}

export interface CreateTenantSamlIdpFederationPayload {
  idpEntityId: string
  ssoUrl: string
  certificatePem?: string
  priority: number
  enabled?: boolean
}

export interface TenantSamlIdpHealthItem {
  idpEntityId: string
  ssoUrl: string
  ssoReachable: boolean
  metadataFresh: boolean
  healthy: boolean
  source: string
}

export interface TenantSamlIdpHealthResponse {
  items: TenantSamlIdpHealthItem[]
}

export interface TenantSamlDisconnectDrillResult {
  drillLogId: string
  idpEntityId: string
  result: string
  latencyMs: number
}

export interface ScimSyncEventSummary {
  pendingCount: number
  tenantPendingCount: number
  conflictStrategy: string
}

export interface ScimChangePreviewItem {
  direction: string
  type: string
  externalId: string
  statusOrOperation: string
  createdAtMs: number
}

export interface ScimChangePreview {
  inboundPendingCount: number
  outboundPendingCount: number
  items: ScimChangePreviewItem[]
}

export interface AdminTenantScimProvisioning {
  tenantId: string
  enabled: boolean
  tokenConfigured: boolean
  usersEndpointUrl: string
  lastSyncAt: number | null
}

export interface AdminScimSchemaExtension {
  tenantId: string
  attributesJson: string
  enterpriseFields: string[]
  configured: boolean
}

export interface TenantOidcMetadataImportResponse {
  tenantId: string
  issuer: string
  authorizationEndpoint: string
  tokenEndpoint: string
  userinfoEndpoint: string
  expectedCallbackUrl: string
  importedAt: number
}

export interface PatchTenantOidcConfigPayload {
  enabled?: boolean
  displayName?: string
  issuerUri?: string
  clientId?: string
  clientSecret?: string
  scopes?: string
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

export interface TenantDataExportArtifact {
  requestId: string
  artifactUrl: string | null
  artifactObjectKey: string | null
  downloadable: boolean
}

export interface TenantMenuDiffEntry {
  itemId: string
  templateTitle: string
  templateEnabled: boolean
  templateSortOrder: number | null
  hasOverride: boolean
  overrideEnabled: boolean | null
  overrideTitle: string | null
  overrideSortOrder: number | null
}

export interface TenantMenuDiffResponse {
  tenantId: string
  entries: TenantMenuDiffEntry[]
}

export interface PutTenantMenuOverridePayload {
  itemId: string
  enabled?: boolean | null
  sortOrder?: number | null
  title?: string | null
}

export interface PostTenantMenuOverrideBatchPayload {
  overrides: PutTenantMenuOverridePayload[]
}
