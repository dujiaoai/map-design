import { describe, expect, it } from 'vitest'

import { filterMenuItemsByPermission } from './filter-nav-by-permission'

describe('filterMenuItemsByPermission', () => {
  it('keeps items without permissionCode', () => {
    const items = [{ id: 'a', title: 'A', kind: 'map-tool' as const, icon: 'Ruler' }]
    expect(filterMenuItemsByPermission(items, [])).toHaveLength(1)
  })

  it('drops items when permission missing', () => {
    const items = [
      {
        id: 'a',
        title: 'A',
        kind: 'map-tool' as const,
        icon: 'Ruler',
        permissionCode: 'workspace:map:write',
      },
    ]
    expect(filterMenuItemsByPermission(items, ['workspace:use'])).toHaveLength(0)
    expect(filterMenuItemsByPermission(items, ['workspace:map:write'])).toHaveLength(1)
  })
})
