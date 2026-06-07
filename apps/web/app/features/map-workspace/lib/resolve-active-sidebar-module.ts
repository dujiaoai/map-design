import { usesLeftContextPanel } from '~/entities/navigation'

import { resolveModuleSectionByModuleId } from './workspace-module-route'

export type SidebarModuleKind = 'uav' | 'workspace'

export interface ActiveSidebarModule {
  kind: SidebarModuleKind
  moduleId: string
}

export function resolveOpenSidebarModule(state: {
  activeDockModuleId: string | null
  dockPanelCollapsed: boolean
  activeModuleId: string | null
  modulePanelCollapsed: boolean
}): ActiveSidebarModule | null {
  if (state.activeDockModuleId && !state.dockPanelCollapsed) {
    return { kind: 'uav', moduleId: state.activeDockModuleId }
  }
  if (state.activeModuleId && !state.modulePanelCollapsed) {
    return { kind: 'workspace', moduleId: state.activeModuleId }
  }
  return null
}

/** 当前展开且由左侧 MapContextPanel 承载的模块（全局互斥，至多一个） */
export function resolveActiveSidebarModule(state: {
  activeDockModuleId: string | null
  dockPanelCollapsed: boolean
  activeModuleId: string | null
  modulePanelCollapsed: boolean
}): ActiveSidebarModule | null {
  const open = resolveOpenSidebarModule(state)
  if (!open) {
    return null
  }
  if (open.kind === 'uav') {
    return open
  }
  if (!usesLeftContextPanel(open.moduleId)) {
    return null
  }
  return open
}

/** 当前展开且走地图原生载体的侧栏模块（display 等） */
export function resolveNativeSidebarModule(state: {
  activeDockModuleId: string | null
  dockPanelCollapsed: boolean
  activeModuleId: string | null
  modulePanelCollapsed: boolean
}): ActiveSidebarModule | null {
  const open = resolveOpenSidebarModule(state)
  if (!open || open.kind === 'uav') {
    return null
  }
  if (usesLeftContextPanel(open.moduleId)) {
    return null
  }
  return open
}

export function resolveCollapsedSidebarModule(state: {
  activeDockModuleId: string | null
  dockPanelCollapsed: boolean
  activeModuleId: string | null
  modulePanelCollapsed: boolean
}): ActiveSidebarModule | null {
  if (state.activeDockModuleId && state.dockPanelCollapsed) {
    return { kind: 'uav', moduleId: state.activeDockModuleId }
  }
  if (state.activeModuleId && state.modulePanelCollapsed) {
    return { kind: 'workspace', moduleId: state.activeModuleId }
  }
  return null
}

export function resolveSidebarModuleSurfaceKey(active: ActiveSidebarModule | null): string | null {
  if (!active) {
    return null
  }
  if (active.kind === 'uav') {
    return `uav:${active.moduleId}`
  }
  const section = resolveModuleSectionByModuleId(active.moduleId)
  return section ? `${section}:${active.moduleId}` : null
}
