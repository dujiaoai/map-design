import { describe, expect, it } from 'vitest'

import { usesSaasSessionBootstrap } from './fetch-saas-session'

describe('usesSaasSessionBootstrap', () => {
  it('is a boolean predicate for bootstrap mode', () => {
    expect(typeof usesSaasSessionBootstrap()).toBe('boolean')
  })
})
