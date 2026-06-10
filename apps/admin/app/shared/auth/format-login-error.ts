function parseProblemDetail(message: string): string | null {
  const bodyMatch = message.match(/Auth API \d{3}: (.+)/)
  if (!bodyMatch?.[1]) return null
  try {
    const parsed = JSON.parse(bodyMatch[1]) as { detail?: string; title?: string }
    return parsed.detail ?? parsed.title ?? null
  } catch {
    return null
  }
}

export function formatLoginError(error: unknown): string {
  if (!(error instanceof Error)) return '登录失败，请稍后重试'
  const message = error.message
  if (message.includes('未配置 apiBaseUrl')) {
    return '未配置 VITE_API_URL，无法连接登录服务'
  }
  const statusMatch = message.match(/Auth API (\d{3}):/)
  if (statusMatch) {
    const status = Number(statusMatch[1])
    if (status === 401) return '邮箱、密码或租户不正确'
    if (status === 403) return '无权访问该租户'
    const detail = parseProblemDetail(message)
    if (detail) return detail
  }
  return '登录失败，请检查账号信息后重试'
}
