import { cn } from '@repo/ui'

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
  const globalSearchQuery = useMapWorkspaceStore((state) => state.globalSearchQuery)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const { panel, open, exiting, mounted } = useMapToolDrawerTransition(activeDrawerTool)

  if (!mounted || !panel) {
    return null
  }

  const meta = resolveNavToolMeta(mockNavMainItems, panel.navItemId)
  const title = meta?.title ?? panel.toolId

  function handleClose() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    toggleMapTool(panel.navItemId)
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
      <div className="text-muted-foreground flex-1 space-y-2 overflow-y-auto p-4 text-sm">
        <p className="text-foreground/80 text-xs">
          地图交互区保持可用；本面板仅占用右侧条带（toolId: {panel.toolId}）。
        </p>
        <p>pluginToolId: {panel.pluginToolId}</p>
        {panel.toolId === 'import-file' ? (
          <p>支持上传文件、目录选择与标绘入库；拾取/预览在地图画布完成。</p>
        ) : panel.toolId === 'global-search' ? (
          <>
            <p>多源检索、历史记录与高级筛选在此展示；快捷候选已在顶栏下拉中呈现。</p>
            {globalSearchQuery.trim() ? (
              <p className="text-foreground/70 rounded-md border border-border px-2 py-1.5 text-xs dark:border-white/10">
                当前检索：<span className="text-foreground">{globalSearchQuery.trim()}</span>
              </p>
            ) : (
              <p className="text-xs">在顶栏输入关键词，Enter 或「查看全部结果」打开本面板。</p>
            )}
          </>
        ) : null}
      </div>
    </aside>
  )
}
