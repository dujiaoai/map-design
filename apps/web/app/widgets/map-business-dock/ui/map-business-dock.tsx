import { cn } from '@repo/ui'

import { mockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import {
  DockPanelCollapseHandle,
  DockPanelExpandEdge,
  DockPanelFrame,
  resolveModuleEdgeIcon,
  resolveModuleEdgeShortLabel,
} from '~/widgets/dock-panel'

/** 地图画布左侧固定业务 Dock（展开时占位列，非浮层） */
export function MapBusinessDock({ hidden = false }: { hidden?: boolean }) {
  const activeModuleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const setModulePanelCollapsed = useMapWorkspaceStore((state) => state.setModulePanelCollapsed)
  const closeMapModule = useMapWorkspaceStore((state) => state.closeMapModule)
  const fullscreen = useMapWorkspaceStore((state) => state.modulePanelFullscreen)
  const toggleModulePanelFullscreen = useMapWorkspaceStore((state) => state.toggleModulePanelFullscreen)

  if (hidden || !activeModuleId || collapsed) {
    return null
  }

  const meta = mockModuleMeta[activeModuleId]
  if (!meta) {
    return null
  }

  return (
    <DockPanelFrame
      title={meta.title}
      fullscreen={fullscreen}
      onToggleFullscreen={() => toggleModulePanelFullscreen()}
      onClose={() => closeMapModule()}
      onExitFullscreen={() => {
        if (fullscreen) toggleModulePanelFullscreen()
      }}
      footer={
        !fullscreen ? (
          <DockPanelCollapseHandle
            label={`收起${meta.title}`}
            className="-right-3.5"
            onClick={() => setModulePanelCollapsed(true)}
          />
        ) : null
      }
    >
      <div className="text-muted-foreground flex-1 overflow-y-auto p-4 text-sm">
        业务模块占位：{meta.title}（moduleId: {activeModuleId}）
      </div>
    </DockPanelFrame>
  )
}

/**
 * 业务 Dock 收起后，地图左缘分割条展开控件（辅助入口，不占列宽）
 * 主入口：侧栏同一菜单项再次点击
 */
export function MapBusinessDockEdge() {
  const activeModuleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const dockCollapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const setModulePanelCollapsed = useMapWorkspaceStore((state) => state.setModulePanelCollapsed)

  if (!activeModuleId || !collapsed) {
    return null
  }

  const meta = mockModuleMeta[activeModuleId]
  if (!meta) {
    return null
  }

  const dockEdgeVisible = Boolean(activeDockModuleId && dockCollapsed)
  const EdgeIcon = resolveModuleEdgeIcon(activeModuleId)

  return (
    <DockPanelExpandEdge
      label={`展开${meta.title}`}
      shortLabel={resolveModuleEdgeShortLabel(activeModuleId, meta.title)}
      icon={EdgeIcon}
      className={cn(dockEdgeVisible ? 'left-8 -translate-x-1/2' : 'left-0 -translate-x-1/2')}
      railClassName={cn(dockEdgeVisible ? 'left-8' : 'left-0')}
      onClick={() => setModulePanelCollapsed(false)}
    />
  )
}
