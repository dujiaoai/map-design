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
  detailLocalizations?: Record<string, string>
  unconfiguredMessage?: string
  schemaMessage?: string
  fallbackMessage?: string
}

function localizeDetail(detail: string, localizations?: Record<string, string>): string {
  if (!localizations) return detail
  return localizations[detail] ?? detail
}

/** 将 Auth API / Zod 抛错转为认证页可读文案 */
export function formatAuthApiError(
  error: unknown,
  {
    statusMessages = {},
    detailLocalizations,
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
    if (problemDetail) {
      return localizeDetail(problemDetail, detailLocalizations)
    }
    const mapped = statusMessages[status]
    if (mapped) return mapped
  }

  if (message.includes('invalid_type') || message.includes('invalid_enum_value')) {
    return schemaMessage
  }

  return fallbackMessage
}

/** 登录/注册/重置等页面共用的 RFC 7807 detail 中文映射 */
export const AUTH_API_DETAIL_LOCALIZATIONS = {
  'Tenant slug is required': '该邮箱关联多个租户，请填写租户标识后再登录',
  'Tenant is suspended': '该租户已停用，请联系管理员',
  'Tenant not found': '租户不存在，请检查租户标识（如 demo）',
  'Account is disabled': '账号已禁用，请联系管理员',
  'Invalid email or password': '邮箱、密码或租户不正确',
  'Invite pending, check your email to set a password': '邀请待接受，请查收邮件设置密码',
  'Email not verified, check your inbox to complete registration': '邮箱未验证，请查收邮件完成注册',
  'Invalid or expired verification link': '验证链接无效或已过期',
  'Invalid or expired reset link': '重置链接无效或已过期',
  'Invalid or expired invite link': '邀请链接无效或已过期',
  'Invite link has reached its usage limit': '邀请链接已达使用上限',
  'Invite link is no longer available': '邀请链接已失效，请联系管理员获取新链接',
  'Email already registered for this tenant': '该邮箱已在此租户注册，请直接登录',
  'Public organization signup is disabled': '当前未开放自助创建组织，请联系管理员或接受邀请加入',
  'Organization identifier must be at least 2 characters': '组织标识至少 2 个字符',
  'Organization identifier format is invalid': '组织标识格式无效，请使用小写字母、数字与连字符',
  'Organization identifier is reserved': '该组织标识已被系统保留，请换一个',
  'Unable to allocate organization identifier': '无法分配组织标识，请修改后重试',
  'Organization name is required to derive identifier': '请填写有效的组织名称',
  'Organization name is required': '请填写组织名称',
  'Email already verified': '邮箱已验证，请直接登录',
  'Password must be at least 8 characters and contain uppercase, lowercase, and a digit':
    '密码须至少 8 位且包含大小写字母与数字',
  'New password must differ from current password': '新密码不能与当前密码相同',
  'Too many login attempts, try again later': '登录尝试过于频繁，请稍后再试',
  'Too many registration attempts, try again later': '注册请求过于频繁，请稍后再试',
  'Too many password reset attempts, try again later': '重置请求过于频繁，请稍后再试',
  'Invalid phone number format': '请输入有效的 11 位手机号',
} as const satisfies Record<string, string>
