import { describe, expect, it } from 'vitest'

import { filterAdminTableRows } from './use-admin-table-filter'

interface SampleRow {
  email: string
  displayName: string
  status: string
}

const rows: SampleRow[] = [
  { email: 'alice@demo.local', displayName: 'Alice', status: 'active' },
  { email: 'bob@demo.local', displayName: 'Bob', status: 'disabled' },
  { email: 'carol@test.local', displayName: 'Carol', status: 'active' },
]

describe('filterAdminTableRows', () => {
  it('returns all rows when search and status are empty', () => {
    expect(
      filterAdminTableRows(rows, {
        search: '',
        searchKeys: ['email', 'displayName'],
        status: 'all',
        statusKey: 'status',
      }),
    ).toHaveLength(3)
  })

  it('filters by search across configured keys', () => {
    expect(
      filterAdminTableRows(rows, {
        search: 'bob',
        searchKeys: ['email', 'displayName'],
      }),
    ).toEqual([rows[1]])
  })

  it('filters by status', () => {
    expect(
      filterAdminTableRows(rows, {
        search: '',
        searchKeys: ['email'],
        status: 'active',
        statusKey: 'status',
      }),
    ).toEqual([rows[0], rows[2]])
  })

  it('combines search and status filters', () => {
    expect(
      filterAdminTableRows(rows, {
        search: 'demo',
        searchKeys: ['email'],
        status: 'active',
        statusKey: 'status',
      }),
    ).toEqual([rows[0]])
  })

  it('returns empty array for undefined rows', () => {
    expect(
      filterAdminTableRows(undefined, {
        search: 'x',
        searchKeys: ['email'],
      }),
    ).toEqual([])
  })
})
