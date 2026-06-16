import { useMemo } from 'react'

import { useEnabledTenantFeatures } from '~/features/team-switcher'
import { useWorkspaceMenusQuery } from '~/shared/queries/menu-queries'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

import { filterNavMainItemsForTenant } from '../lib/filter-nav-by-tenant'
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
  const menusQuery = useWorkspaceMenusQuery(saasBootstrap)

  return useMemo(() => {
    if (menusQuery.data?.items) {
      return resolveNavMainItemsFromApi(menusQuery.data.items)
    }
    return filterNavMainItemsForTenant(mockNavMainItems, enabledTenantFeatures)
  }, [menusQuery.data?.items, enabledTenantFeatures, saasBootstrap])
}

export function useWorkspaceNavSectionDefs(): NavMapSectionDef[] {
  const saasBootstrap = usesSaasSessionBootstrap()
  const enabledTenantFeatures = useEnabledTenantFeatures()
  const menusQuery = useWorkspaceMenusQuery(saasBootstrap)

  return useMemo(() => {
    if (menusQuery.data?.sections) {
      return resolveNavSectionDefsFromApi(menusQuery.data.sections)
    }
    return mockNavMapSectionDefs
  }, [menusQuery.data?.sections, saasBootstrap])
}

export function useWorkspaceMenusReady(): boolean {
  const saasBootstrap = usesSaasSessionBootstrap()
  const menusQuery = useWorkspaceMenusQuery(saasBootstrap)
  if (!saasBootstrap) return true
  return menusQuery.isSuccess || menusQuery.isError
}
