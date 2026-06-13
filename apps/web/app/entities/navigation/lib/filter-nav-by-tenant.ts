import { DEFAULT_TENANT_FEATURES, getModuleTenantFeature } from '../model/mock-nav-items'
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

/** 过滤 mock-nav 顶层项（侧栏段、命令面板、handleNavSelect 共用） */
export function filterNavMainItemsForTenant(
  items: NavMainItem[],
  enabledTenantFeatures: ReadonlySet<string> = new Set(DEFAULT_TENANT_FEATURES),
): NavMainItem[] {
  return filterNavMainItemsByTenant(items, enabledTenantFeatures, getModuleTenantFeature)
}
