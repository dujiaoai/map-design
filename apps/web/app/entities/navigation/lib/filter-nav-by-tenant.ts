import type { NavMainItem, NavMainSubItem } from '../model/types'

function filterSubItems(
  items: NavMainSubItem[],
  enabledFeatures: ReadonlySet<string>,
  hasTenantFeature: (moduleId: string) => string | undefined,
): NavMainSubItem[] {
  return items.filter((sub) => {
    if (sub.kind !== 'map-module' || !sub.moduleId) return true
    const feature = hasTenantFeature(sub.moduleId)
    if (!feature) return true
    return enabledFeatures.has(feature)
  })
}

/** 按租户能力过滤 map-module 叶子（定制项） */
export function filterNavMainItemsByTenant(
  items: NavMainItem[],
  enabledFeatures: ReadonlySet<string>,
  hasTenantFeature: (moduleId: string) => string | undefined,
): NavMainItem[] {
  return items
    .map((item) => {
      if (item.items?.length) {
        const filtered = filterSubItems(item.items, enabledFeatures, hasTenantFeature)
        if (filtered.length === 0) return null
        return { ...item, items: filtered }
      }
      if (item.kind === 'map-module' && item.moduleId) {
        const feature = hasTenantFeature(item.moduleId)
        if (feature && !enabledFeatures.has(feature)) return null
      }
      return item
    })
    .filter((item): item is NavMainItem => item !== null)
}
