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
      'Invite pending, check your email to set a password': '邀请待接受，请查收邮件设置密码',
      'Email not verified, check your inbox to complete registration': '邮箱未验证，请查收邮件完成注册',
      'Invalid or expired verification link': '验证链接无效或已过期',
      'Invalid or expired reset link': '重置链接无效或已过期',
      'New password must differ from current password': '新密码不能与当前密码相同',
    },
    unconfiguredMessage: '未配置 VITE_API_URL，无法连接登录服务',
    fallbackMessage: '登录失败，请检查账号信息后重试',
  })
}
