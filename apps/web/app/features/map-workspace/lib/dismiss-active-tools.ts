import { mockNavMainItems, resolveNavToolMeta } from '~/entities/navigation'

import { useMapWorkspaceStore } from '../model/workspace-store'

function isMovablePanelNavItem(navItemId: string): boolean {
  const meta = resolveNavToolMeta(mockNavMainItems, navItemId)
  return meta?.presentation === 'movable-panel'
}

function minimizeExpandedMovablePanel(state: ReturnType<typeof useMapWorkspaceStore.getState>): boolean {
  if (state.activeMapTool && isMovablePanelNavItem(state.activeMapTool.navItemId)) {
    const navItemId = state.activeMapTool.navItemId
    if (!state.minimizedToolPanels[navItemId]) {
      state.setToolPanelMinimized(navItemId, true)
      return true
    }
  }

  for (const panel of state.activePanelTools) {
    if (!isMovablePanelNavItem(panel.navItemId)) {
      continue
    }
    if (!state.minimizedToolPanels[panel.navItemId]) {
      state.setToolPanelMinimized(panel.navItemId, true)
      return true
    }
  }

  return false
}

export function dismissActiveToolsWithPanelMinimize(): boolean {
  const state = useMapWorkspaceStore.getState()

  if (state.commandPaletteOpen) {
    state.closeCommandPalette()
    return true
  }

  if (state.globalSearchPopoverOpen) {
    state.setGlobalSearchPopoverOpen(false)
    return true
  }

  if (minimizeExpandedMovablePanel(state)) {
    return true
  }

  if (state.activeMapTool || state.activeDrawerTool) {
    state.clearMapTool()
    return true
  }

  if (state.activePanelTools.length > 0) {
    state.clearPanelTools()
    return true
  }

  return false
}
