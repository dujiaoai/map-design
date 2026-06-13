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
      400: '请检查新密码是否符合要求',
    },
    detailLocalizations: {
      'New password must differ from current password': '新密码不能与当前密码相同',
      'Current password is incorrect': '当前密码不正确',
    },
    fallbackMessage: '修改密码失败，请稍后重试',
  })
}
