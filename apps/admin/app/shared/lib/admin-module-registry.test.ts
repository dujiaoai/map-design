import { describe, expect, it } from 'vitest'

import { filterNavItemsForProduct } from './admin-module-registry'
import type { AdminNavItem } from '~/widgets/admin-shell/lib/nav-items'
import { LayoutDashboardIcon } from 'lucide-react'

const sampleItem: AdminNavItem = {
  to: '/demo',
  label: 'Demo',
  icon: LayoutDashboardIcon,
  permissions: [],
}

describe('filterNavItemsForProduct', () => {
  it('returns base items when no product filter', () => {
    expect(filterNavItemsForProduct([sampleItem], null)).toHaveLength(1)
  })

  it('filters module extras by product code', () => {
    const result = filterNavItemsForProduct(
      [sampleItem],
      'map-design',
      [
        {
          id: 'uav-only',
          productCodes: ['uav-cloud'],
          navItems: [{ ...sampleItem, to: '/uav', label: 'UAV' }],
        },
      ],
    )
    expect(result).toHaveLength(1)
    expect(result[0]?.to).toBe('/demo')
  })
})
