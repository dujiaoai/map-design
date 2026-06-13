import { describe, expect, it } from 'vitest'

import { authChangePasswordSchema } from './password-policy'

describe('authChangePasswordSchema', () => {
  const schema = authChangePasswordSchema()

  it('rejects when new password matches old password', () => {
    const result = schema.safeParse({
      oldPassword: 'password',
      newPassword: 'password',
      confirmPassword: 'password',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid change password payload', () => {
    const result = schema.safeParse({
      oldPassword: 'password',
      newPassword: 'newpassword',
      confirmPassword: 'newpassword',
    })
    expect(result.success).toBe(true)
  })
})
