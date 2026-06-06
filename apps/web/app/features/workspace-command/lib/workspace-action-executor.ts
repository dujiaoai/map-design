import type { NavigateFunction } from 'react-router'

import { mockToolMeta, type NavMainItem } from '~/entities/navigation'
import { createNavSelectHandler } from '~/features/map-workspace'
import type { MapWorkspaceStore } from '~/features/map-workspace/model/workspace-store'

import type { WorkspaceAction } from './workspace-action'

export interface WorkspaceActionExecutorDeps {
  items: NavMainItem[]
  navigate: NavigateFunction
  getState: () => Pick<
    MapWorkspaceStore,
    'toggleMapTool' | 'togglePanelTool' | 'toggleMapModule' | 'toggleMapDockModule'
  >
  clearMapTool: () => void
  clearPanelTools: () => void
  setGlobalSearchQuery: (query: string) => void
  openGlobalSearchDrawer: () => void
}

export function createWorkspaceActionExecutor(deps: WorkspaceActionExecutorDeps) {
  return function executeWorkspaceAction(action: WorkspaceAction): boolean {
    const state = deps.getState()
    const handleNavSelect = createNavSelectHandler({
      items: deps.items,
      navigate: deps.navigate,
      togglePanelTool: state.togglePanelTool,
      toggleMapTool: state.toggleMapTool,
      toggleMapModule: state.toggleMapModule,
      toggleMapDockModule: state.toggleMapDockModule,
    })

    switch (action.type) {
      case 'selectNav':
        handleNavSelect(action.navItemId)
        return true
      case 'clearTools':
        deps.clearMapTool()
        return true
      case 'clearPanelTools':
        deps.clearPanelTools()
        return true
      case 'mapSearch':
        deps.setGlobalSearchQuery(action.query)
        return true
      case 'openMapSearchDrawer':
        if (action.query?.trim()) {
          deps.setGlobalSearchQuery(action.query.trim())
        }
        deps.openGlobalSearchDrawer()
        return true
      default:
        return false
    }
  }
}

export function resolveNavItemToolId(items: NavMainItem[], navItemId: string): string | undefined {
  for (const item of items) {
    if (item.id === navItemId) {
      return item.toolId
    }
    const sub = item.items?.find((entry) => entry.id === navItemId)
    if (sub?.toolId) {
      return sub.toolId
    }
  }
  return undefined
}

export function isPanelNavItem(items: NavMainItem[], navItemId: string): boolean {
  const toolId = resolveNavItemToolId(items, navItemId)
  return Boolean(toolId && mockToolMeta[toolId]?.category === 'panel')
}
