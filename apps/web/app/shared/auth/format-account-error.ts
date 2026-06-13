import { AUTH_API_DETAIL_LOCALIZATIONS, formatAuthApiError } from '@repo/auth'

export function formatProfileUpdateError(error: unknown): string {
  return formatAuthApiError(error, {
    fallbackMessage: '保存失败，请稍后重试',
  })
}

export function formatPasswordChangeError(error: unknown): string {
  return formatAuthApiError(error, {
    statusMessages: {
      401: '当前密码不正确',
      400: '请检查新密码是否符合要求',
    },
    detailLocalizations: AUTH_API_DETAIL_LOCALIZATIONS,
    fallbackMessage: '修改密码失败，请稍后重试',
  })
}
