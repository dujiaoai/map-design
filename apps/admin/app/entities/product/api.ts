import { api } from '~/shared/api/client'

import type { FeatureCatalogResponse } from '~/entities/tenant/model'
import type { AdminProduct, AdminProductListResponse } from './model'

export function fetchAdminProducts() {
  return api.get<AdminProductListResponse>('/admin/products')
}

export function fetchAdminProduct(code: string) {
  return api.get<AdminProduct>(`/admin/products/${encodeURIComponent(code)}`)
}

export function fetchAdminProductFeatureCatalog(code: string) {
  return api.get<FeatureCatalogResponse>(`/admin/products/${encodeURIComponent(code)}/features`)
}
