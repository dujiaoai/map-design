import { describe, expect, it } from 'vitest'

import { AUTH_API_DETAIL_LOCALIZATIONS, formatAuthApiError } from './format-auth-api-error'

describe('formatAuthApiError', () => {
  it('prefers RFC 7807 detail with localization', () => {
    const message = formatAuthApiError(
      new Error('Auth API 403: {"detail":"Tenant is suspended"}'),
      { detailLocalizations: AUTH_API_DETAIL_LOCALIZATIONS },
    )
    expect(message).toBe('该租户已停用，请联系管理员')
  })

  it('falls back to status message when body has no detail', () => {
    const message = formatAuthApiError(new Error('Auth API 401: {}'), {
      statusMessages: { 401: '邮箱、密码或租户不正确' },
    })
    expect(message).toBe('邮箱、密码或租户不正确')
  })
})
