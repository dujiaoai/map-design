import { describe, expect, it } from 'vitest'

import { adminQueryKeys } from './admin-query-keys'

describe('adminQueryKeys.members', () => {
  it('embeds list params in the query key', () => {
    expect(adminQueryKeys.members('tenant-1', { sortBy: 'email', sortDir: 'asc' })).toEqual([
      'admin',
      'members',
      'tenant-1',
      { sortBy: 'email', sortDir: 'asc' },
    ])
  })

  it('uses membersRoot as invalidation prefix for filtered queries', () => {
    const root = adminQueryKeys.membersRoot('tenant-1')
    const filtered = adminQueryKeys.members('tenant-1', { q: 'demo', status: 'active' })
    expect(filtered.slice(0, root.length)).toEqual(root)
  })
})
