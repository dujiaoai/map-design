/** 解析 billing-api `/v1/billing` 基址：开发走 Vite proxy；生产可设 VITE_BILLING_API_URL。 */
export function resolveBillingApiBaseUrl(saasApiUrl?: string): string {
  const explicit = import.meta.env.VITE_BILLING_API_URL as string | undefined
  if (explicit?.trim()) {
    const trimmed = explicit.trim().replace(/\/$/, '')
    if (trimmed.endsWith('/v1/billing')) return trimmed
    if (trimmed.startsWith('http')) return `${trimmed}/v1/billing`
    return trimmed
  }

  if (!saasApiUrl) return '/v1/billing'

  const trimmed = saasApiUrl.replace(/\/$/, '')
  if (trimmed.startsWith('http')) {
    const host = trimmed.replace(/\/v1$/, '').replace(/:8082(?=\/|$)/, ':8083')
    return `${host.replace(/\/$/, '')}/v1/billing`
  }

  return '/v1/billing'
}
