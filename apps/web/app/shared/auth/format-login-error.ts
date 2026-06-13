import { formatAuthApiError } from './format-auth-api-error'

/** 将 auth.login 抛错转为登录页可读文案 */
export function formatLoginError(error: unknown): string {
  return formatAuthApiError(error, {
    statusMessages: {
      401: '邮箱、密码或租户不正确',
    },
    detailLocalizations: {
      'Tenant is suspended': '该租户已停用，请联系管理员',
      'Account is disabled': '账号已禁用，请联系管理员',
    },
    unconfiguredMessage: '未配置 VITE_API_URL，无法连接登录服务',
    fallbackMessage: '登录失败，请检查账号信息后重试',
  })
}
