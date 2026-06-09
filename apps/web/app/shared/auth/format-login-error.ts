import { formatAuthApiError } from './format-auth-api-error'

/** 将 auth.login 抛错转为登录页可读文案 */
export function formatLoginError(error: unknown): string {
  return formatAuthApiError(error, {
    statusMessages: {
      401: '邮箱、密码或租户不正确',
      403: '无权访问该租户',
    },
    unconfiguredMessage: '未配置 VITE_API_URL，无法连接登录服务',
    fallbackMessage: '登录失败，请检查账号信息后重试',
  })
}
