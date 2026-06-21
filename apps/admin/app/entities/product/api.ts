import { api } from '~/shared/api/client'

import type { FeatureCatalogResponse } from '~/entities/tenant/model'
import type {
  AdminProduct,
  AdminProductListResponse,
  CreateAdminProductFeaturePayload,
  CreateAdminProductPayload,
} from './model'
import type { FeatureCatalogEntry } from '~/entities/tenant/model'

export function fetchAdminProducts() {
  return api.get<AdminProductListResponse>('/admin/products')
}

export function fetchAdminProduct(code: string) {
  return api.get<AdminProduct>(`/admin/products/${encodeURIComponent(code)}`)
}

export function fetchAdminProductFeatureCatalog(code: string) {
  return api.get<FeatureCatalogResponse>(`/admin/products/${encodeURIComponent(code)}/features`)
}

export function createAdminProduct(payload: CreateAdminProductPayload) {
  return api.post<AdminProduct>('/admin/products', payload)
}

export function createAdminProductFeature(
  productCode: string,
  payload: CreateAdminProductFeaturePayload,
) {
  return api.post<FeatureCatalogEntry>(
    `/admin/products/${encodeURIComponent(productCode)}/features`,
    payload,
  )
}
