import { AUTH_API_DETAIL_LOCALIZATIONS, formatAuthApiError } from '@repo/auth'

/** 将 join-via-invite-link 抛错转为加入页可读文案 */
export function formatJoinError(error: unknown): string {
  return formatAuthApiError(error, {
    statusMessages: {
      403: '该租户已停用，请联系管理员',
      409: '该邮箱已在此租户注册，请直接登录',
      429: '操作过于频繁，请稍后再试',
    },
    detailLocalizations: AUTH_API_DETAIL_LOCALIZATIONS,
    unconfiguredMessage: '未配置 VITE_API_URL，无法连接认证服务',
    fallbackMessage: '加入失败，请检查填写信息后重试',
  })
}

export function suggestsLoginAfterJoinError(message: string): boolean {
  return message.includes('请直接登录')
}

export function loginHrefForTenant(tenantSlug: string): string {
  const slug = tenantSlug.trim()
  if (!slug) return '/login'
  return `/login?tenant=${encodeURIComponent(slug)}`
}

export function formatInviteLinkExpiry(expiresAt: number | null): string {
  if (expiresAt == null) return '永不过期'
  return new Date(expiresAt).toLocaleString('zh-CN')
}

export function formatInviteLinkRemainingUses(remainingUses: number | null): string {
  if (remainingUses == null) return '不限次数'
  if (remainingUses <= 0) return '已用尽'
  return `还可使用 ${remainingUses} 次`
}

export function buildInviteLinkSubtitle(
  expiresAt: number | null,
  remainingUses: number | null,
): string {
  const expiry = formatInviteLinkExpiry(expiresAt)
  const uses = formatInviteLinkRemainingUses(remainingUses)
  return `链接 ${expiry} · ${uses}`
}
