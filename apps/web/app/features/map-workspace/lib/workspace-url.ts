import {
  findNavSubItemByDockModuleId,
  findNavSubItemByModuleId,
  findNavSubItemByToolId,
  mockDockModuleMeta,
  mockModuleMeta,
  mockNavMainItems,
  mockToolMeta,
  resolveNavToolMetaFromUrl,
  type MapToolVariantKey,
  type NavMainItem,
} from '~/entities/navigation'

/** URL 可序列化的地图工作台状态 */
export interface MapWorkspaceUrlState {
  /** 地图互斥工具（measure / plot / point） */
  mapToolId: string | null
  mapToolVariant: MapToolVariantKey | null
  /** Drawer 工具（导入） */
  drawerToolId: string | null
  panelToolIds: string[]
  dockModuleId: string | null
  dockPanelCollapsed: boolean
  moduleId: string | null
  modulePanelCollapsed: boolean
}

const URL_KEYS = ['tool', 'variant', 'panels', 'uav', 'uavDock', 'module', 'dock'] as const

const VARIANT_KEYS = new Set<MapToolVariantKey>(['drawLine', 'drawSurface'])

function parseCsvList(value: string | null): string[] {
  if (!value) return []
  return [...new Set(value.split(',').map((part) => part.trim()).filter(Boolean))]
}

function isKnownPanelTool(toolId: string): boolean {
  return mockToolMeta[toolId]?.category === 'panel'
}

function isKnownBusinessModule(moduleId: string): boolean {
  return Boolean(mockModuleMeta[moduleId])
}

function isKnownDockModule(moduleId: string): boolean {
  return Boolean(mockDockModuleMeta[moduleId])
}

function parseVariantParam(value: string | null): MapToolVariantKey | null {
  if (!value || !VARIANT_KEYS.has(value as MapToolVariantKey)) {
    return null
  }
  return value as MapToolVariantKey
}

/** 从 query 解析可分享状态，忽略未知或非法 id */
export function parseWorkspaceUrl(searchParams: URLSearchParams): MapWorkspaceUrlState {
  const toolCandidate = searchParams.get('tool')
  const variant = parseVariantParam(searchParams.get('variant'))

  let mapToolId: string | null = null
  let mapToolVariant: MapToolVariantKey | null = null
  let drawerToolId: string | null = null

  if (toolCandidate) {
    const resolved = resolveNavToolMetaFromUrl(mockNavMainItems, toolCandidate, variant)
    if (resolved) {
      if (resolved.meta.coordinatorGroup === 'drawer') {
        drawerToolId = toolCandidate
      } else if (resolved.meta.coordinatorGroup === 'mapInteraction') {
        mapToolId = toolCandidate
        mapToolVariant = resolved.meta.variantKey ?? null
      }
    }
  }

  const panelToolIds = parseCsvList(searchParams.get('panels')).filter(isKnownPanelTool)

  const dockCandidate = searchParams.get('uav')
  const dockModuleId = dockCandidate && isKnownDockModule(dockCandidate) ? dockCandidate : null

  const dockPanelCollapsed = dockModuleId !== null && searchParams.get('uavDock') === 'collapsed'

  const moduleCandidate = searchParams.get('module')
  const moduleId = moduleCandidate && isKnownBusinessModule(moduleCandidate) ? moduleCandidate : null

  const modulePanelCollapsed = moduleId !== null && searchParams.get('dock') === 'collapsed'

  return {
    mapToolId,
    mapToolVariant,
    drawerToolId,
    panelToolIds,
    dockModuleId,
    dockPanelCollapsed,
    moduleId,
    modulePanelCollapsed,
  }
}

interface WorkspaceUrlSource {
  activeMapTool: { toolId: string; variantKey?: MapToolVariantKey } | null
  activeDrawerTool: { toolId: string } | null
  activePanelTools: { toolId: string }[]
  activeDockModuleId: string | null
  dockPanelCollapsed: boolean
  activeModuleId: string | null
  modulePanelCollapsed: boolean
}

/** 从 store 提取可分享状态 */
export function selectWorkspaceUrlState(state: WorkspaceUrlSource): MapWorkspaceUrlState {
  return {
    mapToolId: state.activeMapTool?.toolId ?? null,
    mapToolVariant: state.activeMapTool?.variantKey ?? null,
    drawerToolId: state.activeDrawerTool?.toolId ?? null,
    panelToolIds: state.activePanelTools.map((item) => item.toolId),
    dockModuleId: state.activeDockModuleId,
    dockPanelCollapsed: state.dockPanelCollapsed,
    moduleId: state.activeModuleId,
    modulePanelCollapsed: state.modulePanelCollapsed,
  }
}

export function workspaceUrlStatesEqual(
  a: MapWorkspaceUrlState,
  b: MapWorkspaceUrlState,
): boolean {
  if (a.mapToolId !== b.mapToolId) return false
  if (a.mapToolVariant !== b.mapToolVariant) return false
  if (a.drawerToolId !== b.drawerToolId) return false
  if (a.dockModuleId !== b.dockModuleId) return false
  if (a.dockPanelCollapsed !== b.dockPanelCollapsed) return false
  if (a.moduleId !== b.moduleId) return false
  if (a.modulePanelCollapsed !== b.modulePanelCollapsed) return false
  if (a.panelToolIds.length !== b.panelToolIds.length) return false
  return a.panelToolIds.every((id, index) => id === b.panelToolIds[index])
}

/** 将可分享状态写入 URLSearchParams（空状态返回无 query） */
export function buildWorkspaceSearchParams(state: MapWorkspaceUrlState): URLSearchParams {
  const params = new URLSearchParams()

  if (state.mapToolId) {
    params.set('tool', state.mapToolId)
    if (state.mapToolVariant) {
      params.set('variant', state.mapToolVariant)
    }
  } else if (state.drawerToolId) {
    params.set('tool', state.drawerToolId)
  }

  if (state.panelToolIds.length > 0) {
    params.set('panels', state.panelToolIds.join(','))
  }

  if (state.dockModuleId) {
    params.set('uav', state.dockModuleId)
    if (state.dockPanelCollapsed) {
      params.set('uavDock', 'collapsed')
    }
  }

  if (state.moduleId) {
    params.set('module', state.moduleId)
    if (state.modulePanelCollapsed) {
      params.set('dock', 'collapsed')
    }
  }

  return params
}

export function canonicalSearchParams(params: URLSearchParams): string {
  const entries = [...params.entries()]
    .filter(([key]) => URL_KEYS.includes(key as (typeof URL_KEYS)[number]))
    .sort(([a], [b]) => a.localeCompare(b))
  return new URLSearchParams(entries).toString()
}

export function mergeWorkspaceSearchParams(
  current: URLSearchParams,
  state: MapWorkspaceUrlState,
): URLSearchParams {
  const merged = new URLSearchParams(current)
  for (const key of URL_KEYS) {
    merged.delete(key)
  }
  for (const [key, value] of buildWorkspaceSearchParams(state)) {
    merged.set(key, value)
  }
  return merged
}

export function searchParamsEqual(a: URLSearchParams, b: URLSearchParams): boolean {
  return canonicalSearchParams(a) === canonicalSearchParams(b)
}

export interface ActiveMapTool {
  navItemId: string
  toolId: string
  pluginToolId: string
  variant?: Record<string, boolean>
  variantKey?: MapToolVariantKey
}

export interface ActiveDrawerTool {
  navItemId: string
  toolId: string
  pluginToolId: string
}

/** 将 URL 状态解析为 store patch */
export interface WorkspaceStorePatch {
  activeMapTool: ActiveMapTool | null
  activeDrawerTool: ActiveDrawerTool | null
  activePanelTools: { navItemId: string; toolId: string }[]
  activeDockModuleNavId: string | null
  activeDockModuleId: string | null
  dockPanelCollapsed: boolean
  activeModuleNavId: string | null
  activeModuleId: string | null
  modulePanelCollapsed: boolean
}

export function resolveWorkspaceStorePatch(
  urlState: MapWorkspaceUrlState,
  items: NavMainItem[] = mockNavMainItems,
): WorkspaceStorePatch {
  let activeMapTool: ActiveMapTool | null = null
  let activeDrawerTool: ActiveDrawerTool | null = null

  if (urlState.mapToolId) {
    const resolved = resolveNavToolMetaFromUrl(items, urlState.mapToolId, urlState.mapToolVariant)
    if (resolved && resolved.meta.coordinatorGroup === 'mapInteraction') {
      activeMapTool = {
        navItemId: resolved.navItem.id,
        toolId: resolved.navItem.toolId,
        pluginToolId: resolved.meta.pluginToolId,
        variant: resolved.meta.variant,
        variantKey: resolved.meta.variantKey,
      }
    }
  } else if (urlState.drawerToolId) {
    const resolved = resolveNavToolMetaFromUrl(items, urlState.drawerToolId, null)
    if (resolved && resolved.meta.coordinatorGroup === 'drawer') {
      activeDrawerTool = {
        navItemId: resolved.navItem.id,
        toolId: resolved.navItem.toolId,
        pluginToolId: resolved.meta.pluginToolId,
      }
    }
  }

  const activePanelTools = urlState.panelToolIds.flatMap((toolId) => {
    const item = findNavSubItemByToolId(items, toolId)
    if (!item?.toolId) {
      return []
    }
    return [{ navItemId: item.id, toolId: item.toolId }]
  })

  const dockItem = urlState.dockModuleId
    ? findNavSubItemByDockModuleId(items, urlState.dockModuleId)
    : undefined

  const moduleItem = urlState.moduleId
    ? findNavSubItemByModuleId(items, urlState.moduleId)
    : undefined

  return {
    activeMapTool,
    activeDrawerTool,
    activePanelTools,
    activeDockModuleNavId: dockItem?.id ?? null,
    activeDockModuleId: dockItem?.moduleId ?? null,
    dockPanelCollapsed: dockItem ? urlState.dockPanelCollapsed : false,
    activeModuleNavId: moduleItem?.id ?? null,
    activeModuleId: moduleItem?.moduleId ?? null,
    modulePanelCollapsed: moduleItem ? urlState.modulePanelCollapsed : false,
  }
}
