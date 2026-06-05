import { cn } from '@haoxuan/ui'

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
  const { panel, open, exiting, mounted } = useMapToolDrawerTransition(activeDrawerTool)

  if (!mounted || !panel) {
    return null
  }

  const meta = resolveNavToolMeta(mockNavMainItems, panel.navItemId)
  const title = meta?.title ?? panel.toolId

  return (
    <aside
      data-state={exiting ? 'closed' : 'open'}
      className={cn(
        'border-border bg-background/95 absolute top-0 right-0 bottom-0 z-30',
        'flex w-[360px] max-w-[40%] flex-col border-l shadow-lg backdrop-blur-sm',
        'ease-out motion-reduce:transition-none',
        exiting ? 'pointer-events-none' : 'pointer-events-auto',
        exiting
          ? 'animate-out slide-out-to-right fade-out-0'
          : 'animate-in slide-in-from-right fade-in-0',
      )}
      style={{ animationDuration: `${MAP_TOOL_DRAWER_ANIMATION_MS}ms` }}
      role="complementary"
      aria-label={`${title}面板`}
      aria-hidden={exiting}
    >
      <DockPanelHeader
        title={title}
        onClose={() => toggleMapTool(panel.navItemId)}
      />
      <div className="text-muted-foreground flex-1 space-y-2 overflow-y-auto p-4 text-sm">
        <p className="text-foreground/80 text-xs">
          地图交互区保持可用；本面板仅占用右侧条带（toolId: {panel.toolId}）。
        </p>
        <p>pluginToolId: {panel.pluginToolId}</p>
        {panel.toolId === 'import-file' ? (
          <p>支持上传文件、目录选择与标绘入库；拾取/预览在地图画布完成。</p>
        ) : panel.toolId === 'global-search' ? (
          <p>检索结果可定位至地图；画布不被模态层遮挡。</p>
        ) : null}
      </div>
    </aside>
  )
}
