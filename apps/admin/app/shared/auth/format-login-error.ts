const loginDetailLocalizations = {
  'Tenant is suspended': '该租户已停用，请联系管理员',
  'Account is disabled': '账号已禁用，请联系管理员',
} as const

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

function localizeDetail(detail: string): string {
  return loginDetailLocalizations[detail as keyof typeof loginDetailLocalizations] ?? detail
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
    const detail = parseProblemDetail(message)
    if (detail) return localizeDetail(detail)
    if (status === 401) return '邮箱、密码或租户不正确'
  }
  return '登录失败，请检查账号信息后重试'
}
