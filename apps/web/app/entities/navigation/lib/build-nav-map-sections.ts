import type { NavMapSectionUi } from '@repo/ui'

import {
  DEFAULT_TENANT_FEATURES,
  getModuleTenantFeature,
  mockNavMapSectionDefs,
} from '../model/mock-nav-items'
import type { NavMapSectionDef } from '../model/types'
import { filterNavMainItemsByTenant } from './filter-nav-by-tenant'
import { toNavMainUiItems } from './to-nav-main-ui-items'

export function buildNavMapSections(
  defs: NavMapSectionDef[] = mockNavMapSectionDefs,
  activeNavItemIds: string[],
  enabledTenantFeatures: ReadonlySet<string> = new Set(DEFAULT_TENANT_FEATURES),
): NavMapSectionUi[] {
  const featureLookup = (moduleId: string) => getModuleTenantFeature(moduleId)

  return defs
    .map((def) => {
      const filtered = filterNavMainItemsByTenant(def.items, enabledTenantFeatures, featureLookup)
      const items = toNavMainUiItems(filtered, activeNavItemIds)
      return {
        id: def.id,
        label: def.label,
        items,
        collapsible: def.collapsible,
        defaultOpen: def.defaultOpen,
        storageKey: def.storageKey,
      }
    })
    .filter((section) => section.items.length > 0)
}
