import {
  findNavSectionLabelByNavItemId,
  findNavSubItem,
  mockDockModuleMeta,
  mockModuleMeta,
  mockNavMainItems,
  resolveNavToolMeta,
} from '~/entities/navigation'

import type { MapWorkspaceStore } from '../model/workspace-store'

export interface WorkspaceContextSnapshot {
  /** 面包屑二级：侧栏段名（如「数据」「机库」） */
  sectionLabel: string | null
  /** 面包屑三级：当前模块/菜单项名（无选中时为默认工作台名） */
  moduleLabel: string
  /** 面包屑末级：工具/面板等上下文（无则为 null） */
  contextLabel: string | null
  /** 状态栏摘要：当前工具 / 模块 / 面板 */
  statusSummary: string | null
}

type WorkspaceContextState = Pick<
  MapWorkspaceStore,
  | 'activeMapTool'
  | 'activeDrawerTool'
  | 'activePanelTools'
  | 'activeDataModuleNavId'
  | 'activeDataModuleId'
  | 'dataModulePanelCollapsed'
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
  if (state.activeDataModuleId && state.activeDataModuleNavId && !state.dataModulePanelCollapsed) {
    labels.push(
      resolveBusinessModuleTitle(state.activeDataModuleNavId, state.activeDataModuleId),
    )
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

const DEFAULT_MODULE_LABEL = '地图工作台'

function resolveSectionLabel(state: WorkspaceContextState): string | null {
  if (state.activeModuleNavId) {
    return findNavSectionLabelByNavItemId(state.activeModuleNavId)
  }
  if (state.activeDockModuleNavId) {
    return findNavSectionLabelByNavItemId(state.activeDockModuleNavId)
  }
  if (state.activeDataModuleNavId) {
    return findNavSectionLabelByNavItemId(state.activeDataModuleNavId)
  }
  return null
}

function resolveModuleLabel(state: WorkspaceContextState): string {
  if (state.activeModuleId && state.activeModuleNavId) {
    return resolveBusinessModuleTitle(state.activeModuleNavId, state.activeModuleId)
  }
  if (state.activeDockModuleId && state.activeDockModuleNavId) {
    return resolveDockModuleTitle(state.activeDockModuleNavId, state.activeDockModuleId)
  }
  if (state.activeDataModuleId && state.activeDataModuleNavId) {
    return resolveBusinessModuleTitle(state.activeDataModuleNavId, state.activeDataModuleId)
  }
  return DEFAULT_MODULE_LABEL
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
  if (state.activeDataModuleId && state.activeDataModuleNavId && !state.dataModulePanelCollapsed) {
    return resolveBusinessModuleTitle(state.activeDataModuleNavId, state.activeDataModuleId)
  }
  return null
}

export function resolveWorkspaceContext(state: WorkspaceContextState): WorkspaceContextSnapshot {
  const statusLabels = collectStatusLabels(state)

  return {
    sectionLabel: resolveSectionLabel(state),
    moduleLabel: resolveModuleLabel(state),
    contextLabel: resolvePrimaryContextLabel(state),
    statusSummary: statusLabels.length > 0 ? statusLabels.join(' · ') : null,
  }
}

/** 顶栏面包屑：云眼综合服务平台之后的层级（如 数据 → 专题 → 测距） */
export function buildWorkspaceBreadcrumbTrail(
  snapshot: Pick<WorkspaceContextSnapshot, 'sectionLabel' | 'moduleLabel' | 'contextLabel'>,
): string[] {
  const trail: string[] = []

  if (snapshot.sectionLabel && snapshot.moduleLabel !== DEFAULT_MODULE_LABEL) {
    trail.push(snapshot.sectionLabel)
    trail.push(snapshot.moduleLabel)
  } else {
    trail.push(snapshot.moduleLabel)
  }

  if (snapshot.contextLabel && snapshot.contextLabel !== snapshot.moduleLabel) {
    trail.push(snapshot.contextLabel)
  }

  return trail
}
