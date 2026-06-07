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
  /** 顶栏面包屑：「云眼综合服务平台」之后的层级 */
  breadcrumbTrail: string[]
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
  | 'commandPaletteOpen'
  | 'globalSearchPopoverOpen'
>

const GLOBAL_SEARCH_LABEL = '搜索'

/** L4 条带 / 顶栏检索：无侧栏段归属，面包屑不叠在 Dock 模块路径上 */
const STANDALONE_GLOBAL_TOOL_IDS = new Set(['global-search', 'import-file'])

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

const DEFAULT_MODULE_LABEL = '地图工作台'

function resolveSectionLabel(state: WorkspaceContextState): string | null {
  if (state.activeModuleNavId) {
    return findNavSectionLabelByNavItemId(state.activeModuleNavId)
  }
  if (state.activeDockModuleNavId) {
    return findNavSectionLabelByNavItemId(state.activeDockModuleNavId)
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
  return null
}

/** 顶栏 foreground 工具（map-tool / drawer / 单 panel），不含模块回落 */
function resolveForegroundTool(
  state: WorkspaceContextState,
): { navItemId: string; toolId: string } | null {
  if (state.activeMapTool) {
    return state.activeMapTool
  }
  if (state.activeDrawerTool) {
    return state.activeDrawerTool
  }
  if (state.activePanelTools.length === 1) {
    return state.activePanelTools[0] ?? null
  }
  return null
}

function isGlobalSearchSurfaceActive(state: WorkspaceContextState): boolean {
  return state.commandPaletteOpen || state.globalSearchPopoverOpen
}

function isStandaloneGlobalTool(toolId: string): boolean {
  return STANDALONE_GLOBAL_TOOL_IDS.has(toolId)
}

export function resolveWorkspaceContext(state: WorkspaceContextState): WorkspaceContextSnapshot {
  const statusLabels = collectStatusLabels(state)
  const sectionLabel = resolveSectionLabel(state)
  const moduleLabel = resolveModuleLabel(state)
  const contextLabel = resolvePrimaryContextLabel(state)
  const foregroundTool = resolveForegroundTool(state)

  return {
    sectionLabel,
    moduleLabel,
    contextLabel,
    breadcrumbTrail: buildWorkspaceBreadcrumbTrail({
      sectionLabel,
      moduleLabel,
      contextLabel,
      activeDrawerTool: state.activeDrawerTool,
      globalSearchActive: isGlobalSearchSurfaceActive(state),
      foregroundTool,
    }),
    statusSummary: statusLabels.length > 0 ? statusLabels.join(' · ') : null,
  }
}

export interface WorkspaceBreadcrumbInput {
  sectionLabel: string | null
  moduleLabel: string
  contextLabel: string | null
  activeDrawerTool?: { navItemId: string; toolId: string } | null
  globalSearchActive?: boolean
  foregroundTool?: { navItemId: string; toolId: string } | null
}

/** 顶栏面包屑：云眼综合服务平台之后的层级（如 图层 → 专题图层；全局搜索仅「搜索」） */
export function buildWorkspaceBreadcrumbTrail(input: WorkspaceBreadcrumbInput): string[] {
  const {
    sectionLabel,
    moduleLabel,
    contextLabel,
    activeDrawerTool = null,
    globalSearchActive = false,
    foregroundTool = null,
  } = input

  if (activeDrawerTool) {
    return [resolveToolTitle(activeDrawerTool.navItemId, activeDrawerTool.toolId)]
  }

  if (globalSearchActive) {
    return [GLOBAL_SEARCH_LABEL]
  }

  if (
    contextLabel &&
    foregroundTool &&
    isStandaloneGlobalTool(foregroundTool.toolId)
  ) {
    return [contextLabel]
  }

  const trail: string[] = []

  if (sectionLabel && moduleLabel !== DEFAULT_MODULE_LABEL) {
    trail.push(sectionLabel)
    trail.push(moduleLabel)
  } else {
    trail.push(moduleLabel)
  }

  if (contextLabel && contextLabel !== moduleLabel) {
    trail.push(contextLabel)
  }

  return trail
}

/** 供 Zustand 订阅：breadcrumbTrail 为数组，须配合 useShallow */
export function selectWorkspaceBreadcrumbTrail(state: WorkspaceContextState): string[] {
  return resolveWorkspaceContext(state).breadcrumbTrail
}

export function selectWorkspaceStatusSummary(state: WorkspaceContextState): string | null {
  return resolveWorkspaceContext(state).statusSummary
}
