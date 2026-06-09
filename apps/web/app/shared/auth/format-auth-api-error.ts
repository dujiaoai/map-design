function parseAuthApiProblemBody(message: string): string | null {
  const bodyMatch = message.match(/Auth API \d{3}: (.+)/)
  if (!bodyMatch?.[1]) return null

  try {
    const parsed = JSON.parse(bodyMatch[1]) as { detail?: string; title?: string }
    if (parsed.detail) return parsed.detail
    if (parsed.title) return parsed.title
  } catch {
    // 非 JSON 响应体
  }

  return null
}

export interface FormatAuthApiErrorOptions {
  statusMessages?: Partial<Record<number, string>>
  unconfiguredMessage?: string
  schemaMessage?: string
  fallbackMessage?: string
}

/** 将 Auth API / Zod 抛错转为认证页可读文案 */
export function formatAuthApiError(
  error: unknown,
  {
    statusMessages = {},
    unconfiguredMessage = '未配置 VITE_API_URL，无法连接认证服务',
    schemaMessage = '服务端响应格式异常，请稍后重试',
    fallbackMessage = '操作失败，请稍后重试',
  }: FormatAuthApiErrorOptions = {},
): string {
  if (!(error instanceof Error)) return fallbackMessage

  const message = error.message
  if (message.includes('未配置 apiBaseUrl')) return unconfiguredMessage

  const statusMatch = message.match(/Auth API (\d{3}):/)
  if (statusMatch) {
    const status = Number(statusMatch[1])
    const problemDetail = parseAuthApiProblemBody(message)
    const mapped = statusMessages[status]
    if (mapped) return mapped
    if (problemDetail) return problemDetail
  }

  if (message.includes('invalid_type') || message.includes('invalid_enum_value')) {
    return schemaMessage
  }

  return fallbackMessage
}
