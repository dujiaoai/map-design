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

/** 将 auth.login / Auth API 抛错转为登录页可读文案 */
export function formatLoginError(error: unknown): string {
  if (!(error instanceof Error)) return '登录失败，请稍后重试'

  const message = error.message
  if (message.includes('未配置 apiBaseUrl')) return '未配置 VITE_API_URL，无法连接登录服务'

  const statusMatch = message.match(/Auth API (\d{3}):/)
  if (statusMatch) {
    const status = Number(statusMatch[1])
    const problemDetail = parseAuthApiProblemBody(message)

    if (status === 401) return '邮箱、密码或租户不正确'
    if (status === 403) return problemDetail ?? '无权访问该租户'
    if (problemDetail) return problemDetail
  }

  if (message.includes('invalid_type') || message.includes('invalid_enum_value')) {
    return '登录响应格式异常，请稍后重试或联系管理员'
  }

  return '登录失败，请检查账号信息后重试'
}
