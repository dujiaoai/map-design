import { MapIcon } from 'lucide-react'

import { resolveWorkspaceContext, useMapEngineReady, useMapWorkspaceStore } from '~/features/map-workspace'

export function MapPlaceholder() {
  const mapEngineReady = useMapEngineReady()
  const activeMapTool = useMapWorkspaceStore((state) => state.activeMapTool)
  const activeDrawerTool = useMapWorkspaceStore((state) => state.activeDrawerTool)
  const activePanelTools = useMapWorkspaceStore((state) => state.activePanelTools)
  const statusSummary = useMapWorkspaceStore((state) => resolveWorkspaceContext(state).statusSummary)

  const hasToolContext = Boolean(
    activeMapTool || activeDrawerTool || activePanelTools.length > 0 || statusSummary,
  )

  if (mapEngineReady) {
    return null
  }

  if (hasToolContext) {
    return (
      <div className="workspace-map-stage workspace-map-stage--hint pointer-events-none absolute inset-0 z-[1]">
        <p className="workspace-map-hint cc-mono">地图引擎待接入 · EPSG:4326</p>
      </div>
    )
  }

  return (
    <div className="workspace-map-stage pointer-events-none absolute inset-0 z-[1]">
      <div className="workspace-map-hud workspace-map-hud--compact">
        <div className="workspace-map-hud-icon" aria-hidden>
          <MapIcon className="size-5 text-brand-light/90" />
        </div>
        <div className="space-y-1 text-left">
          <p className="workspace-map-title cc-display text-base">地图引擎待接入</p>
          <p className="workspace-map-subtitle normal-case tracking-normal">
            EPSG:4326 · 接入 SDK 后本提示自动隐藏
          </p>
        </div>
        <p className="workspace-map-hint cc-mono max-w-sm text-left">
          使用顶栏搜索（/）· 上方快捷工具 · 侧栏打开数据与业务模块
        </p>
      </div>
    </div>
  )
}
