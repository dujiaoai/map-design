import { formatAuthApiError } from './format-auth-api-error'

export function formatProfileUpdateError(error: unknown): string {
  return formatAuthApiError(error, {
    fallbackMessage: '保存失败，请稍后重试',
  })
}

export function formatPasswordChangeError(error: unknown): string {
  return formatAuthApiError(error, {
    statusMessages: {
      401: '当前密码不正确',
    },
    fallbackMessage: '修改密码失败，请稍后重试',
  })
}
