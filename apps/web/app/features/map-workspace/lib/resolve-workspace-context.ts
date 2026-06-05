import {
  findNavSubItem,
  mockDockModuleMeta,
  mockModuleMeta,
  mockNavMainItems,
  resolveNavToolMeta,
} from '~/entities/navigation'

import type { MapWorkspaceStore } from '../model/workspace-store'

export interface WorkspaceContextSnapshot {
  /** 面包屑末级标签（无激活上下文时为 null） */
  contextLabel: string | null
  /** 状态栏摘要：当前工具 / 模块 / 面板 */
  statusSummary: string | null
}

type WorkspaceContextState = Pick<
  MapWorkspaceStore,
  | 'activeMapTool'
  | 'activeDrawerTool'
  | 'activePanelTools'
  | 'activeDockModuleNavId'
  | 'activeDockModuleId'
  | 'dockPanelCollapsed'
  | 'activeModuleNavId'
  | 'activeModuleId'
  | 'modulePanelCollapsed'
>

function resolveNavItemTitle(navItemId: string): string | undefined {
  return findNavSubItem(mockNavMainItems, navItemId)?.title
}

function resolveToolTitle(navItemId: string, toolId: string): string {
  return (
    resolveNavToolMeta(mockNavMainItems, navItemId)?.title ??
    resolveNavItemTitle(navItemId) ??
    toolId
  )
}

function resolveDockModuleTitle(navItemId: string, moduleId: string): string {
  return mockDockModuleMeta[moduleId]?.title ?? resolveNavItemTitle(navItemId) ?? moduleId
}

function resolveBusinessModuleTitle(navItemId: string, moduleId: string): string {
  return mockModuleMeta[moduleId]?.title ?? resolveNavItemTitle(navItemId) ?? moduleId
}

function collectStatusLabels(state: WorkspaceContextState): string[] {
  const labels: string[] = []

  if (state.activeMapTool) {
    labels.push(
      resolveToolTitle(state.activeMapTool.navItemId, state.activeMapTool.toolId),
    )
  }
  if (state.activeDrawerTool) {
    labels.push(
      resolveToolTitle(state.activeDrawerTool.navItemId, state.activeDrawerTool.toolId),
    )
  }
  for (const panel of state.activePanelTools) {
    labels.push(resolveToolTitle(panel.navItemId, panel.toolId))
  }
  if (state.activeDockModuleId && state.activeDockModuleNavId && !state.dockPanelCollapsed) {
    labels.push(
      resolveDockModuleTitle(state.activeDockModuleNavId, state.activeDockModuleId),
    )
  }
  if (state.activeModuleId && state.activeModuleNavId && !state.modulePanelCollapsed) {
    labels.push(
      resolveBusinessModuleTitle(state.activeModuleNavId, state.activeModuleId),
    )
  }

  return labels
}

function resolvePrimaryContextLabel(state: WorkspaceContextState): string | null {
  if (state.activeMapTool) {
    return resolveToolTitle(state.activeMapTool.navItemId, state.activeMapTool.toolId)
  }
  if (state.activeDrawerTool) {
    return resolveToolTitle(state.activeDrawerTool.navItemId, state.activeDrawerTool.toolId)
  }
  if (state.activePanelTools.length === 1) {
    const panel = state.activePanelTools[0]
    return resolveToolTitle(panel.navItemId, panel.toolId)
  }
  if (state.activePanelTools.length > 1) {
    return state.activePanelTools
      .map((panel) => resolveToolTitle(panel.navItemId, panel.toolId))
      .join('、')
  }
  if (state.activeDockModuleId && state.activeDockModuleNavId && !state.dockPanelCollapsed) {
    return resolveDockModuleTitle(state.activeDockModuleNavId, state.activeDockModuleId)
  }
  if (state.activeModuleId && state.activeModuleNavId && !state.modulePanelCollapsed) {
    return resolveBusinessModuleTitle(state.activeModuleNavId, state.activeModuleId)
  }
  return null
}

export function resolveWorkspaceContext(state: WorkspaceContextState): WorkspaceContextSnapshot {
  const statusLabels = collectStatusLabels(state)

  return {
    contextLabel: resolvePrimaryContextLabel(state),
    statusSummary: statusLabels.length > 0 ? statusLabels.join(' · ') : null,
  }
}
