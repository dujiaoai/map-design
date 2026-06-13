import { describe, expect, it } from 'vitest'

import { authEmailFieldSchema, authTenantIdFieldSchema } from './auth-form-schema'

describe('authEmailFieldSchema', () => {
  it('trims and lowercases email', () => {
    expect(authEmailFieldSchema.parse('  User@Demo.local  ')).toBe('user@demo.local')
  })
})

describe('authTenantIdFieldSchema', () => {
  it('trims tenant slug', () => {
    expect(authTenantIdFieldSchema.parse('  demo  ')).toBe('demo')
  })
})
