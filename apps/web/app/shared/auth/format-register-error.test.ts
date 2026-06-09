import { describe, expect, it } from 'vitest'

import { formatRegisterError } from './format-register-error'

describe('formatRegisterError', () => {
  it('maps 404 to tenant not found message', () => {
    expect(formatRegisterError(new Error('Auth API 404: {"detail":"Tenant not found"}'))).toBe(
      '租户不存在，请检查租户标识（如 demo）',
    )
  })

  it('maps 409 to duplicate email message', () => {
    expect(
      formatRegisterError(
        new Error('Auth API 409: {"detail":"Email already registered for this tenant"}'),
      ),
    ).toBe('该邮箱已在此租户注册，请直接登录')
  })
})
