import { mockNavMainItems, resolveNavToolMeta } from '~/entities/navigation'

import type { MapWorkspaceStore } from '../model/workspace-store'

export function hasLeftAnchorTools(
  state: Pick<MapWorkspaceStore, 'activeMapTool' | 'activePanelTools'>,
): boolean {
  if (state.activeMapTool) {
    const meta = resolveNavToolMeta(mockNavMainItems, state.activeMapTool.navItemId)
    if (meta?.presentation === 'anchor' && meta.placement === 'left') {
      return true
    }
  }

  for (const panel of state.activePanelTools) {
    const meta = resolveNavToolMeta(mockNavMainItems, panel.navItemId)
    if (meta?.presentation === 'anchor' && meta.placement === 'left') {
      return true
    }
  }

  return false
}
