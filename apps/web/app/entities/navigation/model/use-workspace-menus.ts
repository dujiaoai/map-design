import { useMemo } from 'react'

import { useEnabledTenantFeatures } from '~/features/team-switcher'
import { useWorkspaceMenusQuery } from '~/shared/queries/menu-queries'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'
import { useSessionAccess } from '~/shared/session/use-session-access'

import { filterNavMainItemsForTenant } from '../lib/filter-nav-by-tenant'
import {
  filterMenuItemsByPermission,
  filterMenuSectionsByPermission,
} from '../lib/filter-nav-by-permission'
import { resolveNavMainItemsFromApi, resolveNavSectionDefsFromApi } from '../lib/resolve-api-menus'
import {
  mockNavMainItems,
  mockNavMapSectionDefs,
} from '../model/mock-nav-items'
import type { NavMainItem, NavMapSectionDef } from '../model/types'

/** 侧栏/命令面板菜单：SaaS 会话优先 GET /v1/menus，否则 mock-nav + C-09 过滤 */
export function useWorkspaceNavMainItems(): NavMainItem[] {
  const saasBootstrap = usesSaasSessionBootstrap()
  const enabledTenantFeatures = useEnabledTenantFeatures()
  const { permissions } = useSessionAccess()
  const menusQuery = useWorkspaceMenusQuery(saasBootstrap)

  return useMemo(() => {
    if (menusQuery.data?.items) {
      const items = filterMenuItemsByPermission(menusQuery.data.items, permissions)
      return resolveNavMainItemsFromApi(items)
    }
    return filterNavMainItemsForTenant(mockNavMainItems, enabledTenantFeatures)
  }, [menusQuery.data?.items, enabledTenantFeatures, permissions, saasBootstrap])
}

export function useWorkspaceNavSectionDefs(): NavMapSectionDef[] {
  const saasBootstrap = usesSaasSessionBootstrap()
  const enabledTenantFeatures = useEnabledTenantFeatures()
  const { permissions } = useSessionAccess()
  const menusQuery = useWorkspaceMenusQuery(saasBootstrap)

  return useMemo(() => {
    if (menusQuery.data?.sections) {
      const sections = filterMenuSectionsByPermission(menusQuery.data.sections, permissions)
      return resolveNavSectionDefsFromApi(sections)
    }
    return mockNavMapSectionDefs
  }, [menusQuery.data?.sections, permissions, saasBootstrap])
}

export function useWorkspaceMenusReady(): boolean {
  const saasBootstrap = usesSaasSessionBootstrap()
  const menusQuery = useWorkspaceMenusQuery(saasBootstrap)
  if (!saasBootstrap) return true
  return menusQuery.isSuccess || menusQuery.isError
}
