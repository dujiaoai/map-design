import { mockDockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import {
  DockPanelCollapseHandle,
  DockPanelExpandEdge,
  DockPanelFrame,
  resolveDockModuleEdgeIcon,
  resolveModuleEdgeShortLabel,
} from '~/widgets/dock-panel'

/** 机库模块左侧固定 Dock（与地图业务 Dock 并列，互不挤占状态） */
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
      <div className="text-muted-foreground flex-1 overflow-y-auto p-4 text-sm">
        机库模块占位：{meta.title}（moduleId: {activeDockModuleId}）
      </div>
    </DockPanelFrame>
  )
}

/** 机库 Dock 收起后，地图左缘分割条展开控件 */
export function MapDockPanelEdge() {
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const setDockPanelCollapsed = useMapWorkspaceStore((state) => state.setDockPanelCollapsed)

  if (!activeDockModuleId || !collapsed) {
    return null
  }

  const meta = mockDockModuleMeta[activeDockModuleId]
  if (!meta) {
    return null
  }

  return (
    <DockPanelExpandEdge
      label={`展开${meta.title}`}
      shortLabel={resolveModuleEdgeShortLabel(activeDockModuleId, meta.title)}
      icon={resolveDockModuleEdgeIcon(activeDockModuleId)}
      className="left-0 -translate-x-1/2"
      railClassName="left-0"
      onClick={() => setDockPanelCollapsed(false)}
    />
  )
}
