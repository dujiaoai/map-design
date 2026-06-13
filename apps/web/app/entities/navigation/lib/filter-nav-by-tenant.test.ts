import { describe, expect, it } from 'vitest'

import { mockNavOpsItems } from '../model/mock-nav-items'
import { buildNavMapSections } from './build-nav-map-sections'
import { filterNavMainItemsByTenant } from './filter-nav-by-tenant'

describe('filterNavMainItemsByTenant', () => {
  const featureLookup = (moduleId: string) => {
    if (moduleId === 'custom-highway-alert') return 'custom.highway-alert'
    if (moduleId === 'custom-live-share') return 'custom.live-share'
    return undefined
  }

  it('keeps modules without tenantFeature', () => {
    const filtered = filterNavMainItemsByTenant(
      mockNavOpsItems,
      new Set(['custom.live-share']),
      featureLookup,
    )
    const ids = filtered.map((item) => item.id)
    expect(ids).toContain('module-view-project')
    expect(ids).not.toContain('module-custom-highway-alert')
    expect(ids).toContain('module-custom-live-share')
  })

  it('removes gated modules when feature set is empty', () => {
    const filtered = filterNavMainItemsByTenant(mockNavOpsItems, new Set(), featureLookup)
    const ids = filtered.map((item) => item.id)
    expect(ids).not.toContain('module-custom-highway-alert')
    expect(ids).not.toContain('module-custom-live-share')
  })
})

describe('buildNavMapSections', () => {
  it('drops ops section when all gated modules are filtered out and others remain', () => {
    const sections = buildNavMapSections(undefined, [], new Set(['custom.highway-alert']))
    const ops = sections.find((section) => section.id === 'ops')
    expect(ops?.items.some((item) => item.id === 'module-custom-highway-alert')).toBe(true)
    expect(ops?.items.some((item) => item.id === 'module-custom-live-share')).toBe(false)
  })
})
