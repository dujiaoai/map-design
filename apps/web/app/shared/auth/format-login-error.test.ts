import { describe, expect, it } from 'vitest'

import { formatLoginError } from './format-login-error'

describe('formatLoginError', () => {
  it('maps Auth API 401 to credential message', () => {
    expect(
      formatLoginError(
        new Error(
          'Auth API 401: {"status":401,"detail":"Invalid email or password"}',
        ),
      ),
    ).toBe('邮箱、密码或租户不正确')
  })

  it('maps Auth API 403 to tenant message', () => {
    expect(formatLoginError(new Error('Auth API 403: Forbidden'))).toBe('无权访问，请联系管理员')
  })

  it('uses HTTP status code not body substring for 401 vs 403', () => {
    const jwtWith403InBody =
      'Auth API 401: {"accessToken":"eyJhbGciOiJIUzI1NiJ9.eyJzdGF0dXMiOjQwMywic3ViIjoiMSJ9.sig"}'
    expect(formatLoginError(new Error(jwtWith403InBody))).toBe('邮箱、密码或租户不正确')
  })

  it('uses RFC7807 detail when present', () => {
    expect(
      formatLoginError(
        new Error('Auth API 400: {"title":"Bad Request","detail":"Tenant slug is required"}'),
      ),
    ).toBe('该邮箱关联多个租户，请填写租户标识后再登录')
  })
})
