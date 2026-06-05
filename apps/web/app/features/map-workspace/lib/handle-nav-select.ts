import type { NavigateFunction } from 'react-router'

import { findNavSubItem, mockToolMeta, type NavMainItem } from '~/entities/navigation'

export function createNavSelectHandler(options: {
  items: NavMainItem[]
  navigate: NavigateFunction
  toggleMapTool: (navItemId: string) => void
  togglePanelTool: (navItemId: string, toolId: string) => void
  toggleMapModule: (navItemId: string, moduleId: string) => void
  toggleMapDockModule: (navItemId: string, moduleId: string) => void
}) {
  return function handleNavSelect(id: string) {
    const item = findNavSubItem(options.items, id)
    if (!item) return

    switch (item.kind) {
      case 'map-tool':
        if (!item.toolId) break
        if (mockToolMeta[item.toolId]?.category === 'panel') {
          options.togglePanelTool(id, item.toolId)
        } else {
          options.toggleMapTool(id)
        }
        break
      case 'map-dock-module':
        if (item.moduleId) {
          options.toggleMapDockModule(id, item.moduleId)
        }
        break
      case 'map-module':
        if (item.moduleId) {
          options.toggleMapModule(id, item.moduleId)
        }
        break
      case 'route':
        if (item.url) {
          void options.navigate(item.url)
        }
        break
      case 'external':
        if (item.href) {
          window.open(item.href, '_blank', 'noopener,noreferrer')
        }
        break
    }
  }
}
