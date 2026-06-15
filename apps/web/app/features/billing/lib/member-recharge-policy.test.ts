import { SaaSRole, type SessionUser } from '@repo/auth'
import { describe, expect, it } from 'vitest'

import { TenantFeatureCodes } from './tenant-feature-codes'
import { canMemberSelfRecharge } from './member-recharge-policy'

function user(roles: SessionUser['roles']): SessionUser {
  return {
    id: 'user-1',
    email: 'member@demo.local',
    name: 'Member',
    roles,
    permissions: [],
  }
}

describe('canMemberSelfRecharge', () => {
  it('allows tenant admin regardless of feature flag', () => {
    const features = new Set([TenantFeatureCodes.MEMBERS_RECHARGE_DISABLED])
    expect(canMemberSelfRecharge(user([SaaSRole.TENANT_ADMIN]), features)).toBe(true)
  })

  it('blocks members when tenant disables member recharge', () => {
    const features = new Set([TenantFeatureCodes.MEMBERS_RECHARGE_DISABLED])
    expect(canMemberSelfRecharge(user([SaaSRole.MEMBER]), features)).toBe(false)
  })

  it('allows members when feature is not disabled', () => {
    expect(canMemberSelfRecharge(user([SaaSRole.MEMBER]), new Set())).toBe(true)
  })

  it('returns false without user', () => {
    expect(canMemberSelfRecharge(undefined, new Set())).toBe(false)
  })
})
