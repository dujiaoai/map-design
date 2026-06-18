import { auth } from '~/shared/auth/client'
import { env } from '~/shared/config/env'
import { resolveSaasApiBaseUrl } from '~/shared/config/saas-api-base-url'

export async function downloadAdminUsageTrendsCsv() {
  const token = auth.getAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const baseUrl = resolveSaasApiBaseUrl(env.VITE_API_URL)
  const response = await fetch(`${baseUrl}/admin/stats/usage-trends/export`, {
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
  anchor.download = `usage-trends-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}
