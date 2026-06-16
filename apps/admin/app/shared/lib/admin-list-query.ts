export interface AdminListQuery {
  q?: string
  page?: number
  size?: number
  status?: 'active' | 'disabled' | 'invited'
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  action?: string
  crossTenant?: boolean
  tenantId?: string
  from?: number
  to?: number
  actorUserId?: string
}

export function buildAdminListQuery(params?: AdminListQuery) {
  const search = new URLSearchParams()
  if (params?.q) search.set('q', params.q)
  if (params?.page != null) search.set('page', String(params.page))
  if (params?.size != null) search.set('size', String(params.size))
  if (params?.status) search.set('status', params.status)
  if (params?.sortBy) search.set('sortBy', params.sortBy)
  if (params?.sortDir) search.set('sortDir', params.sortDir)
  if (params?.action) search.set('action', params.action)
  if (params?.crossTenant != null) search.set('crossTenant', String(params.crossTenant))
  if (params?.tenantId) search.set('tenantId', params.tenantId)
  if (params?.from != null) search.set('from', String(params.from))
  if (params?.to != null) search.set('to', String(params.to))
  if (params?.actorUserId) search.set('actorUserId', params.actorUserId)
  const query = search.toString()
  return query ? `?${query}` : ''
}
