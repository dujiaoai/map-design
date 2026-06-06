import { MockModuleContent } from '~/entities/mock-workspace-content'
import { mockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import {
  DockPanelCollapseHandle,
  DockPanelExpandEdge,
  DockPanelFrame,
  resolveModuleEdgeIcon,
  resolveModuleEdgeShortLabel,
} from '~/widgets/dock-panel'

type BusinessDockSlot = 'data' | 'workspace'

function useBusinessDockSlotState(slot: BusinessDockSlot) {
  const isData = slot === 'data'

  const moduleId = useMapWorkspaceStore((state) =>
    isData ? state.activeDataModuleId : state.activeModuleId,
  )
  const collapsed = useMapWorkspaceStore((state) =>
    isData ? state.dataModulePanelCollapsed : state.modulePanelCollapsed,
  )
  const setCollapsed = useMapWorkspaceStore((state) =>
    isData ? state.setDataModulePanelCollapsed : state.setModulePanelCollapsed,
  )
  const closeModule = useMapWorkspaceStore((state) =>
    isData ? state.closeDataModule : state.closeMapModule,
  )
  const fullscreen = useMapWorkspaceStore((state) =>
    isData ? state.dataModulePanelFullscreen : state.modulePanelFullscreen,
  )
  const toggleFullscreen = useMapWorkspaceStore((state) =>
    isData ? state.toggleDataModulePanelFullscreen : state.toggleModulePanelFullscreen,
  )

  return { moduleId, collapsed, setCollapsed, closeModule, fullscreen, toggleFullscreen }
}

/** 地图画布左侧固定业务 Dock（展开时占位列，非浮层） */
export function MapBusinessDock({
  hidden = false,
  slot = 'workspace',
}: {
  hidden?: boolean
  slot?: BusinessDockSlot
}) {
  const { moduleId, collapsed, setCollapsed, closeModule, fullscreen, toggleFullscreen } =
    useBusinessDockSlotState(slot)

  if (hidden || !moduleId || collapsed) {
    return null
  }

  const meta = mockModuleMeta[moduleId]
  if (!meta) {
    return null
  }

  return (
    <DockPanelFrame
      title={meta.title}
      fullscreen={fullscreen}
      onToggleFullscreen={() => toggleFullscreen()}
      onClose={() => closeModule()}
      onExitFullscreen={() => {
        if (fullscreen) toggleFullscreen()
      }}
      footer={
        !fullscreen ? (
          <DockPanelCollapseHandle
            label={`收起${meta.title}`}
            className="-right-3.5"
            onClick={() => setCollapsed(true)}
          />
        ) : null
      }
    >
      <MockModuleContent moduleId={moduleId} title={meta.title} />
    </DockPanelFrame>
  )
}

/**
 * 业务 Dock 收起后，地图左缘分割条展开控件（辅助入口，不占列宽）
 * 主入口：侧栏同一菜单项再次点击
 */
export function MapBusinessDockEdge({ slot = 'workspace' }: { slot?: BusinessDockSlot }) {
  const isData = slot === 'data'
  const { moduleId, collapsed, setCollapsed } = useBusinessDockSlotState(slot)

  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const dockCollapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const activeModuleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const modulePanelCollapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const activeDataModuleId = useMapWorkspaceStore((state) => state.activeDataModuleId)
  const dataModulePanelCollapsed = useMapWorkspaceStore((state) => state.dataModulePanelCollapsed)
  const contextPanelPresent = useMapWorkspaceStore((state) => state.contextPanelPresent)

  if (!moduleId || !collapsed || contextPanelPresent) {
    return null
  }

  const meta = mockModuleMeta[moduleId]
  if (!meta) {
    return null
  }

  const dockEdgeVisible = Boolean(activeDockModuleId && dockCollapsed)
  const workspaceEdgeVisible = Boolean(activeModuleId && modulePanelCollapsed && slot === 'workspace')
  const dataEdgeVisible = Boolean(activeDataModuleId && dataModulePanelCollapsed && slot === 'data')

  const stackCount =
    Number(dockEdgeVisible) + Number(workspaceEdgeVisible) + Number(dataEdgeVisible)
  const stackIndex =
    slot === 'data'
      ? Number(dockEdgeVisible) + Number(workspaceEdgeVisible)
      : slot === 'workspace'
        ? Number(dockEdgeVisible)
        : 0

  const EdgeIcon = resolveModuleEdgeIcon(moduleId)

  return (
    <DockPanelExpandEdge
      label={`展开${meta.title}`}
      shortLabel={resolveModuleEdgeShortLabel(moduleId, meta.title)}
      icon={EdgeIcon}
      stackIndex={stackIndex}
      stackCount={stackCount || 1}
      onClick={() => setCollapsed(false)}
    />
  )
}
