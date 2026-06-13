import { AUTH_API_DETAIL_LOCALIZATIONS, formatAuthApiError } from '@repo/auth'

/** 将 auth.register 抛错转为注册页可读文案 */
export function formatRegisterError(error: unknown): string {
  return formatAuthApiError(error, {
    statusMessages: {
      403: '该租户已停用，请联系管理员',
      404: '租户不存在，请检查租户标识（如 demo）',
      409: '该邮箱已在此租户注册，请直接登录',
      429: '操作过于频繁，请稍后再试',
    },
    detailLocalizations: AUTH_API_DETAIL_LOCALIZATIONS,
    unconfiguredMessage: '未配置 VITE_API_URL，无法连接注册服务',
    fallbackMessage: '注册失败，请检查填写信息后重试',
  })
}
