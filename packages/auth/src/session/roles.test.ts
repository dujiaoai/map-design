import { describe, expect, it } from 'vitest'
import { SaaSRole, type Session } from '../types'
import { hasAnyRole, requireRole } from './roles'

const session: Session = {
  user: {
    id: '1',
    email: 'a@b.com',
    roles: [SaaSRole.MEMBER],
  },
  tenant: { id: 't1', name: 'Tenant' },
}

describe('roles', () => {
  it('hasAnyRole 匹配成员角色', () => {
    expect(hasAnyRole(session.user.roles, [SaaSRole.MEMBER, SaaSRole.VIEWER])).toBe(true)
  })

  it('requireRole 无会话时 redirect', () => {
    const redirect = (path: string) =>
      new Response(null, { status: 302, headers: { Location: path } })
    expect(() => requireRole(null, SaaSRole.MEMBER, redirect)).toThrow()
  })

  it('requireRole 权限不足时 redirect 403', () => {
    const redirect = (path: string) =>
      new Response(null, { status: 302, headers: { Location: path } })
    expect(() => requireRole(session, SaaSRole.PLATFORM_ADMIN, redirect)).toThrow()
  })
})
