import { cn } from '@repo/ui'

import { MockDrawerToolContent } from '~/entities/mock-workspace-content'
import { mockNavMainItems, resolveNavToolMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import { DockPanelHeader } from '~/widgets/dock-panel'

import {
  MAP_TOOL_DRAWER_ANIMATION_MS,
  useMapToolDrawerTransition,
} from '../lib/use-map-tool-drawer-transition'

/**
 * L4 工具面板：贴地图画布右侧，无遮罩，地图其余区域可继续交互（导入/搜索等）。
 */
export function MapToolDrawerPanel() {
  const activeDrawerTool = useMapWorkspaceStore((state) => state.activeDrawerTool)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const { panel, exiting, mounted } = useMapToolDrawerTransition(activeDrawerTool)

  if (!mounted || !panel) {
    return null
  }

  const meta = resolveNavToolMeta(mockNavMainItems, panel.navItemId)
  const title = meta?.title ?? panel.toolId
  const navItemId = panel.navItemId

  function handleClose() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    toggleMapTool(navItemId)
  }

  return (
    <aside
      data-state={exiting ? 'closed' : 'open'}
      className={cn(
        'cc-glass-panel border-border absolute top-0 right-0 bottom-0 z-30',
        'flex w-[360px] max-w-[40%] flex-col border-l',
        'ease-out motion-reduce:transition-none',
        exiting ? 'pointer-events-none' : 'pointer-events-auto',
        exiting
          ? 'animate-out slide-out-to-right fade-out-0'
          : 'animate-in slide-in-from-right fade-in-0',
      )}
      style={{ animationDuration: `${MAP_TOOL_DRAWER_ANIMATION_MS}ms` }}
      role="complementary"
      aria-label={`${title}面板`}
      inert={exiting ? true : undefined}
    >
      <DockPanelHeader title={title} onClose={handleClose} />
      <MockDrawerToolContent
        toolId={panel.toolId}
        navItemId={panel.navItemId}
        title={title}
        pluginToolId={panel.pluginToolId}
      />
    </aside>
  )
}
