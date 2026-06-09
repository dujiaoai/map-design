import { describe, expect, it } from 'vitest'

import { profileFormSchema, resetPasswordSchema } from './account-schemas'

describe('profileFormSchema', () => {
  it('accepts valid display name', () => {
    expect(profileFormSchema.safeParse({ name: 'Demo Admin' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(profileFormSchema.safeParse({ name: '   ' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('requires matching passwords and min length', () => {
    expect(
      resetPasswordSchema.safeParse({
        oldPassword: 'password',
        newPassword: 'short',
        confirmPassword: 'short',
      }).success,
    ).toBe(false)

    expect(
      resetPasswordSchema.safeParse({
        oldPassword: 'password',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword',
      }).success,
    ).toBe(true)
  })
})
