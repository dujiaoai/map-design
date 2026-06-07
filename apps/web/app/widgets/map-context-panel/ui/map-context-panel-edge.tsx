import { mockDockModuleMeta, mockModuleMeta, usesLeftContextPanel } from '~/entities/navigation'
import {
  resolveCollapsedSidebarModule,
  type ActiveSidebarModule,
} from '~/features/map-workspace/lib/resolve-active-sidebar-module'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import {
  DockPanelExpandEdge,
  resolveDockModuleEdgeIcon,
  resolveModuleEdgeIcon,
  resolveModuleEdgeShortLabel,
} from '~/widgets/dock-panel'
import { useShallow } from 'zustand/react/shallow'

function selectCollapsedSidebarModuleState(state: ReturnType<typeof useMapWorkspaceStore.getState>) {
  return {
    activeDockModuleId: state.activeDockModuleId,
    dockPanelCollapsed: state.dockPanelCollapsed,
    activeModuleId: state.activeModuleId,
    modulePanelCollapsed: state.modulePanelCollapsed,
    contextPanelPresent: state.contextPanelPresent,
  }
}

function resolveCollapsedModuleMeta(module: ActiveSidebarModule) {
  if (module.kind === 'uav') {
    return mockDockModuleMeta[module.moduleId]
  }
  return mockModuleMeta[module.moduleId]
}

function resolveCollapsedModuleIcon(module: ActiveSidebarModule) {
  if (module.kind === 'uav') {
    return resolveDockModuleEdgeIcon(module.moduleId)
  }
  return resolveModuleEdgeIcon(module.moduleId)
}

/** 侧栏模块收起后，地图左缘唯一展开条（全局互斥，无堆叠） */
export function MapContextPanelEdge() {
  const {
    contextPanelPresent,
    setDockPanelCollapsed,
    setModulePanelCollapsed,
    ...sidebarState
  } = useMapWorkspaceStore(
    useShallow((state) => ({
      ...selectCollapsedSidebarModuleState(state),
      setDockPanelCollapsed: state.setDockPanelCollapsed,
      setModulePanelCollapsed: state.setModulePanelCollapsed,
    })),
  )

  const collapsedModule = resolveCollapsedSidebarModule(sidebarState)

  if (!collapsedModule || contextPanelPresent) {
    return null
  }

  if (collapsedModule.kind !== 'uav' && !usesLeftContextPanel(collapsedModule.moduleId)) {
    return null
  }

  const meta = resolveCollapsedModuleMeta(collapsedModule)
  if (!meta) {
    return null
  }

  function expandPanel() {
    if (collapsedModule!.kind === 'uav') {
      setDockPanelCollapsed(false)
    } else {
      setModulePanelCollapsed(false)
    }
  }

  const EdgeIcon = resolveCollapsedModuleIcon(collapsedModule)

  return (
    <DockPanelExpandEdge
      label={`展开${meta.title}`}
      shortLabel={resolveModuleEdgeShortLabel(collapsedModule.moduleId, meta.title)}
      icon={EdgeIcon}
      stackIndex={0}
      stackCount={1}
      onClick={expandPanel}
    />
  )
}
