import { describe, expect, it } from 'vitest'

import { moveItemAtIndex, normalizeItemSortOrders } from './menu-admin-types'

describe('moveItemAtIndex', () => {
  it('moves an item to a new index', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    expect(moveItemAtIndex(items, 0, 2).map((item) => item.id)).toEqual(['b', 'c', 'a'])
  })

  it('returns the same array when indices are equal', () => {
    const items = [{ id: 'a' }, { id: 'b' }]
    expect(moveItemAtIndex(items, 1, 1)).toBe(items)
  })
})

describe('normalizeItemSortOrders', () => {
  it('assigns sequential sortOrder values', () => {
    const items = [
      { id: 'a', sortOrder: 99 },
      { id: 'b', sortOrder: 5 },
    ]
    expect(normalizeItemSortOrders(items).map((item) => item.sortOrder)).toEqual([0, 1])
  })
})
