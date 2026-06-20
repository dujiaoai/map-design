import { api } from '~/shared/api/client'

import type { AdminProduct, AdminProductListResponse } from './model'

export function fetchAdminProducts() {
  return api.get<AdminProductListResponse>('/admin/products')
}

export function fetchAdminProduct(code: string) {
  return api.get<AdminProduct>(`/admin/products/${encodeURIComponent(code)}`)
}
