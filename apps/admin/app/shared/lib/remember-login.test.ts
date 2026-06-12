import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearRememberLogin,
  loadRememberLogin,
  saveRememberLogin,
} from './remember-login'

const STORAGE_KEY = 'saas-admin:remember-login'

describe('remember-login', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves and loads remembered credentials', () => {
    saveRememberLogin('admin@demo.local', 'secret', 'demo')
    expect(loadRememberLogin()).toEqual({
      email: 'admin@demo.local',
      password: 'secret',
      tenantSlug: 'demo',
    })
  })

  it('returns null for invalid payload', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: 'a@t.local' }))
    expect(loadRememberLogin()).toBeNull()
  })

  it('clears stored credentials', () => {
    saveRememberLogin('admin@demo.local', 'secret')
    clearRememberLogin()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
