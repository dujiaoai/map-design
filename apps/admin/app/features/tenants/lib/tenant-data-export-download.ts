import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'
import { resolveSaasApiBaseUrl } from '~/shared/config/saas-api-base-url'

export async function downloadTenantDataExport(tenantId: string, requestId: string) {
  const token = auth.getAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const baseUrl = resolveSaasApiBaseUrl(env.VITE_API_URL)
  const url = `${baseUrl}/admin/tenants/${tenantId}/data-export-requests/${requestId}/artifact/download`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/zip',
    },
  })

  if (!response.ok) {
    throw new Error(`Export download failed (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = `tenant-export-${requestId.slice(0, 8)}.zip`
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}
