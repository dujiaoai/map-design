/** 解析 SaaS `/v1` API 基址：支持相对路径（走 vite proxy）或绝对 URL。 */
export function resolveSaasApiBaseUrl(apiUrl?: string): string {
  if (!apiUrl) return '/v1'

  const trimmed = apiUrl.replace(/\/$/, '')
  if (trimmed.endsWith('/v1')) return trimmed
  if (trimmed.startsWith('http')) return `${trimmed}/v1`
  return trimmed
}
