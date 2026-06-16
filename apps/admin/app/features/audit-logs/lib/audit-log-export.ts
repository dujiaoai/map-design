import type { AdminListQuery } from '~/shared/api/admin-api'
import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'
import { resolveSaasApiBaseUrl } from '~/shared/config/saas-api-base-url'

function buildExportQuery(params?: AdminListQuery) {
  const search = new URLSearchParams()
  if (params?.q) search.set('q', params.q)
  if (params?.action) search.set('action', params.action)
  if (params?.crossTenant != null) search.set('crossTenant', String(params.crossTenant))
  if (params?.tenantId) search.set('tenantId', params.tenantId)
  if (params?.from != null) search.set('from', String(params.from))
  if (params?.to != null) search.set('to', String(params.to))
  const query = search.toString()
  return query ? `?${query}` : ''
}

export async function downloadAdminAuditLogsCsv(params?: AdminListQuery) {
  const token = auth.getAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const baseUrl = resolveSaasApiBaseUrl(env.VITE_API_URL)
  const url = `${baseUrl}/admin/audit-logs/export${buildExportQuery(params)}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/csv',
    },
  })

  if (!response.ok) {
    throw new Error(`Export failed (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}
