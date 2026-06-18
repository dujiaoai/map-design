import { buildAdminListQuery, type AdminListQuery } from '~/shared/lib/admin-list-query'
import { api } from '~/shared/api/client'

import type {
  AdminTenantFeaturesResponse,
  AdminTenantListResponse,
  AdminTenantOidcConfig,
  AdminTenantSamlConfig,
  AdminTenantScimProvisioning,
  AdminScimSchemaExtension,
  AdminTenantStorageEstimate,
  AdminTenantSummary,
  CreateTenantPayload,
  FeatureCatalogResponse,
  PatchTenantOidcConfigPayload,
  PatchTenantSamlConfigPayload,
  PatchTenantPayload,
  PostTenantMenuOverrideBatchPayload,
  TenantDataExportRequest,
  TenantDataExportRequestListResponse,
  TenantDataExportArtifact,
  TenantMenuDiffResponse,
  PutTenantMenuOverridePayload,
  TenantMenuOverride,
  TenantMenuOverrideListResponse,
  TenantOidcMetadataImportResponse,
  TenantSamlMetadataImportResponse,
  TenantSamlSpCertificateRotateResponse,
  AdminTenantSamlIdpRegistrationListResponse,
  AdminTenantSamlIdpApproveResponse,
  AdminScimGroupMappingRuleListResponse,
  TenantQuotasResponse,
} from './model'

export function fetchAdminTenants(params?: AdminListQuery) {
  return api.get<AdminTenantListResponse>(`/admin/tenants${buildAdminListQuery(params)}`)
}

export function fetchAdminTenant(tenantId: string) {
  return api.get<AdminTenantSummary>(`/admin/tenants/${tenantId}`)
}

export function createAdminTenant(payload: CreateTenantPayload) {
  return api.post<AdminTenantSummary>('/admin/tenants', payload)
}

export function patchAdminTenant(tenantId: string, payload: PatchTenantPayload) {
  return api.patch<AdminTenantSummary>(`/admin/tenants/${tenantId}`, payload)
}

export function fetchFeatureCatalog() {
  return api.get<FeatureCatalogResponse>('/admin/feature-catalog')
}

export function fetchTenantFeatures(tenantId: string) {
  return api.get<AdminTenantFeaturesResponse>(`/admin/tenants/${tenantId}/features`)
}

export function updateTenantFeatures(tenantId: string, featureCodes: string[]) {
  return api.put<AdminTenantFeaturesResponse>(`/admin/tenants/${tenantId}/features`, {
    featureCodes,
  })
}

export function fetchTenantQuotas(tenantId: string) {
  return api.get<TenantQuotasResponse>(`/tenants/${tenantId}/quotas`)
}

export function fetchTenantDataExportRequests(tenantId: string) {
  return api.get<TenantDataExportRequestListResponse>(
    `/admin/tenants/${tenantId}/data-export-requests`,
  )
}

export function createTenantDataExportRequest(tenantId: string) {
  return api.post<TenantDataExportRequest>(
    `/admin/tenants/${tenantId}/data-export-requests`,
    {},
  )
}

export function fetchTenantOidcConfig(tenantId: string) {
  return api.get<AdminTenantOidcConfig>(`/admin/tenants/${tenantId}/oidc-config`)
}

export function fetchTenantSamlConfig(tenantId: string) {
  return api.get<AdminTenantSamlConfig>(`/admin/tenants/${tenantId}/saml-config`)
}

export function fetchTenantScimProvisioning(tenantId: string) {
  return api.get<AdminTenantScimProvisioning>(`/admin/tenants/${tenantId}/scim-provisioning`)
}

export function fetchTenantScimSchemaExtension(tenantId: string) {
  return api.get<AdminScimSchemaExtension>(`/admin/tenants/${tenantId}/scim-schema-extension`)
}

export function generateTenantScimToken(tenantId: string) {
  return api.post<{ tenantId: string; token: string; usersEndpointUrl: string }>(
    `/admin/tenants/${tenantId}/scim-provisioning/generate-token`,
    {},
  )
}

export function patchTenantOidcConfig(tenantId: string, payload: PatchTenantOidcConfigPayload) {
  return api.patch<AdminTenantOidcConfig>(`/admin/tenants/${tenantId}/oidc-config`, payload)
}

export function patchTenantSamlConfig(tenantId: string, payload: PatchTenantSamlConfigPayload) {
  return api.patch<AdminTenantSamlConfig>(`/admin/tenants/${tenantId}/saml-config`, payload)
}

export function importTenantOidcMetadata(tenantId: string) {
  return api.post<TenantOidcMetadataImportResponse>(
    `/admin/tenants/${tenantId}/oidc-config/import-metadata`,
    {},
  )
}

export function importTenantSamlMetadata(tenantId: string) {
  return api.post<TenantSamlMetadataImportResponse>(
    `/admin/tenants/${tenantId}/saml-config/import-metadata`,
    {},
  )
}

export function rotateTenantSamlSpCertificate(tenantId: string) {
  return api.post<TenantSamlSpCertificateRotateResponse>(
    `/admin/tenants/${tenantId}/saml-config/rotate-sp-certificate`,
    {},
  )
}

export function fetchTenantSamlIdpRegistrations(tenantId: string) {
  return api.get<AdminTenantSamlIdpRegistrationListResponse>(
    `/admin/tenants/${tenantId}/saml-idp-registrations`,
  )
}

export function approveTenantSamlIdpRegistration(tenantId: string, registrationId: string) {
  return api.post<AdminTenantSamlIdpApproveResponse>(
    `/admin/tenants/${tenantId}/saml-idp-registrations/${registrationId}/approve`,
    {},
  )
}

export function fetchTenantStorageEstimate(tenantId: string) {
  return api.get<AdminTenantStorageEstimate>(`/admin/tenants/${tenantId}/storage-estimate`)
}

export function fetchTenantMenuOverrides(tenantId: string) {
  return api.get<TenantMenuOverrideListResponse>(`/admin/tenants/${tenantId}/menu-overrides`)
}

export function putTenantMenuOverride(tenantId: string, payload: PutTenantMenuOverridePayload) {
  return api.put<TenantMenuOverride>(`/admin/tenants/${tenantId}/menu-overrides`, payload)
}

export function postTenantMenuOverridesBatch(
  tenantId: string,
  payload: PostTenantMenuOverrideBatchPayload,
) {
  return api.post<TenantMenuOverrideListResponse>(
    `/admin/tenants/${tenantId}/menu-overrides/batch`,
    payload,
  )
}

export function deleteTenantMenuOverride(tenantId: string, itemId: string) {
  return api.delete<void>(`/admin/tenants/${tenantId}/menu-overrides/${encodeURIComponent(itemId)}`)
}

export function fetchTenantDataExportArtifact(tenantId: string, requestId: string) {
  return api.get<TenantDataExportArtifact>(
    `/admin/tenants/${tenantId}/data-export-requests/${requestId}/artifact`,
  )
}

export function fetchTenantMenuDiff(tenantId: string) {
  return api.get<TenantMenuDiffResponse>(`/admin/tenants/${tenantId}/menu-overrides/diff`)
}

export function fetchTenantScimGroupMappingRules(tenantId: string) {
  return api.get<AdminScimGroupMappingRuleListResponse>(
    `/admin/tenants/${tenantId}/scim-group-mapping-rules`,
  )
}
