export interface AdminProduct {
  id: string
  code: string
  name: string
  description: string | null
  status: 'active' | 'inactive'
  createdAt: number
}

export interface AdminProductListResponse {
  products: AdminProduct[]
}
