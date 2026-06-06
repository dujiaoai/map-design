import { MockModuleContent } from '~/entities/mock-workspace-content'
import { mockDockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import {
  DockPanelCollapseHandle,
  DockPanelExpandEdge,
  DockPanelFrame,
  resolveDockModuleEdgeIcon,
  resolveModuleEdgeShortLabel,
} from '~/widgets/dock-panel'

/** 机库模块左侧固定 Dock（与非数据业务模块全局互斥） */
export function MapDockPanel({ hidden = false }: { hidden?: boolean }) {
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const setDockPanelCollapsed = useMapWorkspaceStore((state) => state.setDockPanelCollapsed)
  const closeMapDockModule = useMapWorkspaceStore((state) => state.closeMapDockModule)
  const fullscreen = useMapWorkspaceStore((state) => state.dockPanelFullscreen)
  const toggleDockPanelFullscreen = useMapWorkspaceStore((state) => state.toggleDockPanelFullscreen)

  if (hidden || !activeDockModuleId || collapsed) {
    return null
  }

  const meta = mockDockModuleMeta[activeDockModuleId]
  if (!meta) {
    return null
  }

  return (
    <DockPanelFrame
      title={meta.title}
      fullscreen={fullscreen}
      onToggleFullscreen={() => toggleDockPanelFullscreen()}
      onClose={() => closeMapDockModule()}
      onExitFullscreen={() => {
        if (fullscreen) toggleDockPanelFullscreen()
      }}
      footer={
        !fullscreen ? (
          <DockPanelCollapseHandle
            label={`收起${meta.title}`}
            className="-right-3.5"
            onClick={() => setDockPanelCollapsed(true)}
          />
        ) : null
      }
    >
      <MockModuleContent moduleId={activeDockModuleId} title={meta.title} />
    </DockPanelFrame>
  )
}

/** 机库 Dock 收起后，地图左缘分割条展开控件 */
export function MapDockPanelEdge() {
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const setDockPanelCollapsed = useMapWorkspaceStore((state) => state.setDockPanelCollapsed)
  const activeModuleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const modulePanelCollapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const activeDataModuleId = useMapWorkspaceStore((state) => state.activeDataModuleId)
  const dataModulePanelCollapsed = useMapWorkspaceStore((state) => state.dataModulePanelCollapsed)
  const contextPanelPresent = useMapWorkspaceStore((state) => state.contextPanelPresent)

  if (!activeDockModuleId || !collapsed || contextPanelPresent) {
    return null
  }

  const meta = mockDockModuleMeta[activeDockModuleId]
  if (!meta) {
    return null
  }

  const workspaceEdgeVisible = Boolean(activeModuleId && modulePanelCollapsed)
  const dataEdgeVisible = Boolean(activeDataModuleId && dataModulePanelCollapsed)
  const stackCount = 1 + Number(workspaceEdgeVisible) + Number(dataEdgeVisible)

  return (
    <DockPanelExpandEdge
      label={`展开${meta.title}`}
      shortLabel={resolveModuleEdgeShortLabel(activeDockModuleId, meta.title)}
      icon={resolveDockModuleEdgeIcon(activeDockModuleId)}
      stackIndex={0}
      stackCount={stackCount}
      onClick={() => setDockPanelCollapsed(false)}
    />
  )
}
