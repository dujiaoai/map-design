import { AUTH_API_DETAIL_LOCALIZATIONS, formatAuthApiError } from '@repo/auth'

/** 将 auth.login 抛错转为登录页可读文案 */
export function formatLoginError(error: unknown): string {
  return formatAuthApiError(error, {
    statusMessages: {
      400: '请填写租户标识后再登录',
      401: '邮箱、密码或租户不正确',
      429: '操作过于频繁，请稍后再试',
    },
    detailLocalizations: AUTH_API_DETAIL_LOCALIZATIONS,
    unconfiguredMessage: '未配置 VITE_API_URL，无法连接登录服务',
    fallbackMessage: '登录失败，请检查账号信息后重试',
  })
}
