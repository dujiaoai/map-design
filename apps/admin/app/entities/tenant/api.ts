import { buildAdminListQuery, type AdminListQuery } from '~/shared/lib/admin-list-query'
import { api } from '~/shared/api/client'

import type {
  AdminTenantFeaturesResponse,
  AdminTenantListResponse,
  AdminTenantOidcConfig,
  AdminTenantStorageEstimate,
  AdminTenantSummary,
  CreateTenantPayload,
  FeatureCatalogResponse,
  PatchTenantOidcConfigPayload,
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

export function patchTenantOidcConfig(tenantId: string, payload: PatchTenantOidcConfigPayload) {
  return api.patch<AdminTenantOidcConfig>(`/admin/tenants/${tenantId}/oidc-config`, payload)
}

export function importTenantOidcMetadata(tenantId: string) {
  return api.post<TenantOidcMetadataImportResponse>(
    `/admin/tenants/${tenantId}/oidc-config/import-metadata`,
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
