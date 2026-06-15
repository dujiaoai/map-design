import { describe, expect, it } from 'vitest'

import { sortAdminTableRows } from './use-admin-table-sort'

describe('sortAdminTableRows', () => {
  const rows = [
    { name: 'Charlie', slug: 'c' },
    { name: 'Alice', slug: 'a' },
    { name: 'Bob', slug: 'b' },
  ]

  it('returns rows unchanged when sort is null', () => {
    expect(sortAdminTableRows(rows, null, { name: (row) => row.name })).toEqual(rows)
  })

  it('sorts ascending by accessor', () => {
    expect(
      sortAdminTableRows(rows, { key: 'name', direction: 'asc' }, { name: (row) => row.name }),
    ).toEqual([
      { name: 'Alice', slug: 'a' },
      { name: 'Bob', slug: 'b' },
      { name: 'Charlie', slug: 'c' },
    ])
  })

  it('sorts descending by accessor', () => {
    expect(
      sortAdminTableRows(rows, { key: 'slug', direction: 'desc' }, { slug: (row) => row.slug }),
    ).toEqual([
      { name: 'Charlie', slug: 'c' },
      { name: 'Bob', slug: 'b' },
      { name: 'Alice', slug: 'a' },
    ])
  })
})
