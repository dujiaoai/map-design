import {
  findNavSubItemByModuleId,
  findNavSubItemByToolId,
  mockNavMainItems,
  mockToolMeta,
  resolveNavToolMetaFromUrl,
  type MapToolVariantKey,
  type NavMainItem,
} from '~/entities/navigation'

import {
  buildWorkspaceModulePath,
  isNonDataModuleSection,
  parseWorkspaceModulePath,
  resolveNavItemFromModuleRoute,
  type WorkspaceModuleRoute,
  type WorkspaceModuleSection,
} from './workspace-module-route'

/** URL 可序列化的地图工作台 query 状态（工具类） */
export interface MapWorkspaceUrlState {
  /** 地图互斥工具（measure / plot / point） */
  mapToolId: string | null
  mapToolVariant: MapToolVariantKey | null
  /** Drawer 工具（导入） */
  drawerToolId: string | null
  panelToolIds: string[]
  /** 数据段业务模块（可与非数据子路由并存时走 query） */
  dataModuleId: string | null
  dataModuleCollapsed: boolean
  /** 非数据段模块子路由（机库 / 运营 / 全景，全局互斥） */
  nonDataModuleRoute: WorkspaceModuleRoute | null
  nonDataModuleCollapsed: boolean
}

const URL_KEYS = ['tool', 'variant', 'panels', 'data', 'dataDock', 'dock'] as const

const VARIANT_KEYS = new Set<MapToolVariantKey>(['drawLine', 'drawSurface'])

function parseCsvList(value: string | null): string[] {
  if (!value) return []
  return [...new Set(value.split(',').map((part) => part.trim()).filter(Boolean))]
}

function isKnownPanelTool(toolId: string): boolean {
  return mockToolMeta[toolId]?.category === 'panel'
}

function parseVariantParam(value: string | null): MapToolVariantKey | null {
  if (!value || !VARIANT_KEYS.has(value as MapToolVariantKey)) {
    return null
  }
  return value as MapToolVariantKey
}

function parseDataModuleFromQuery(
  searchParams: URLSearchParams,
): Pick<MapWorkspaceUrlState, 'dataModuleId' | 'dataModuleCollapsed'> {
  const dataCandidate = searchParams.get('data')
  const dataModuleId =
    dataCandidate && parseWorkspaceModulePath(`/data/${dataCandidate}`)
      ? dataCandidate
      : null
  const dataModuleCollapsed = dataModuleId !== null && searchParams.get('dataDock') === 'collapsed'
  return { dataModuleId, dataModuleCollapsed }
}

function parseNonDataModuleFromPath(
  pathname: string,
  searchParams: URLSearchParams,
): Pick<MapWorkspaceUrlState, 'nonDataModuleRoute' | 'nonDataModuleCollapsed'> {
  const route = parseWorkspaceModulePath(pathname)
  if (!route || !isNonDataModuleSection(route.section)) {
    return { nonDataModuleRoute: null, nonDataModuleCollapsed: false }
  }
  return {
    nonDataModuleRoute: route,
    nonDataModuleCollapsed: searchParams.get('dock') === 'collapsed',
  }
}

function parseDataModuleFromPath(
  pathname: string,
  searchParams: URLSearchParams,
): Pick<MapWorkspaceUrlState, 'dataModuleId' | 'dataModuleCollapsed'> {
  const route = parseWorkspaceModulePath(pathname)
  if (!route || route.section !== 'data') {
    return { dataModuleId: null, dataModuleCollapsed: false }
  }
  return {
    dataModuleId: route.moduleId,
    dataModuleCollapsed: searchParams.get('dataDock') === 'collapsed',
  }
}

/** 从 pathname + query 解析可分享状态 */
export function parseWorkspaceUrl(
  searchParams: URLSearchParams,
  pathname = '/',
): MapWorkspaceUrlState {
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

  const pathRoute = parseWorkspaceModulePath(pathname)
  const nonDataFromPath = parseNonDataModuleFromPath(pathname, searchParams)
  const dataFromPath = parseDataModuleFromPath(pathname, searchParams)
  const dataFromQuery = parseDataModuleFromQuery(searchParams)

  let dataModuleId: string | null = null
  let dataModuleCollapsed = false

  if (pathRoute?.section === 'data') {
    dataModuleId = dataFromPath.dataModuleId
    dataModuleCollapsed = dataFromPath.dataModuleCollapsed
  } else if (dataFromQuery.dataModuleId) {
    dataModuleId = dataFromQuery.dataModuleId
    dataModuleCollapsed = dataFromQuery.dataModuleCollapsed
  }

  return {
    mapToolId,
    mapToolVariant,
    drawerToolId,
    panelToolIds,
    dataModuleId,
    dataModuleCollapsed,
    nonDataModuleRoute: nonDataFromPath.nonDataModuleRoute,
    nonDataModuleCollapsed: nonDataFromPath.nonDataModuleCollapsed,
  }
}

interface WorkspaceUrlSource {
  activeMapTool: { toolId: string; variantKey?: MapToolVariantKey } | null
  activeDrawerTool: { toolId: string } | null
  activePanelTools: { toolId: string }[]
  activeDataModuleId: string | null
  dataModulePanelCollapsed: boolean
  activeDockModuleId: string | null
  dockPanelCollapsed: boolean
  activeModuleId: string | null
  modulePanelCollapsed: boolean
}

export interface WorkspaceLocationState {
  pathname: string
  searchParams: URLSearchParams
}

/** 从 store 提取可分享的 pathname + query */
export function selectWorkspaceLocation(state: WorkspaceUrlSource): WorkspaceLocationState {
  const searchParams = buildWorkspaceSearchParams(selectWorkspaceUrlState(state))

  let pathname = '/'
  if (state.activeDockModuleId) {
    const section = resolveNonDataSectionFromStore(state)
    if (section) {
      pathname = buildWorkspaceModulePath({ section, moduleId: state.activeDockModuleId })
    }
  } else if (state.activeModuleId) {
    const section = resolveNonDataSectionFromStore(state)
    if (section) {
      pathname = buildWorkspaceModulePath({ section, moduleId: state.activeModuleId })
    }
  } else if (state.activeDataModuleId) {
    pathname = buildWorkspaceModulePath({ section: 'data', moduleId: state.activeDataModuleId })
  }

  if (
    state.activeDataModuleId &&
    (state.activeDockModuleId || state.activeModuleId) &&
    pathname !== buildWorkspaceModulePath({ section: 'data', moduleId: state.activeDataModuleId })
  ) {
    searchParams.set('data', state.activeDataModuleId)
    if (state.dataModulePanelCollapsed) {
      searchParams.set('dataDock', 'collapsed')
    }
  }

  return { pathname, searchParams }
}

function resolveNonDataSectionFromStore(
  state: WorkspaceUrlSource,
): Exclude<WorkspaceModuleSection, 'data'> | null {
  const moduleId = state.activeDockModuleId ?? state.activeModuleId
  if (!moduleId) return null
  if (state.activeDockModuleId) return 'uav'
  if (mockNavOpsModuleIds.has(moduleId)) return 'ops'
  if (mockNavPanoramaModuleIds.has(moduleId)) return 'panorama'
  return null
}

const mockNavOpsModuleIds = new Set(
  ['view-project', 'flight-ledger', 'flight-ai-alerts', 'custom-highway-alert', 'custom-live-share'],
)
const mockNavPanoramaModuleIds = new Set(['panorama-produce', 'panorama-viewer'])

/** 从 store 提取可分享 query 状态（不含 pathname） */
export function selectWorkspaceUrlState(state: WorkspaceUrlSource): MapWorkspaceUrlState {
  const nonDataModuleRoute = (() => {
    if (state.activeDockModuleId) {
      return { section: 'uav' as const, moduleId: state.activeDockModuleId }
    }
    if (state.activeModuleId) {
      const section = resolveNonDataSectionFromStore(state)
      if (section && section !== 'uav') {
        return { section, moduleId: state.activeModuleId }
      }
    }
    return null
  })()

  return {
    mapToolId: state.activeMapTool?.toolId ?? null,
    mapToolVariant: state.activeMapTool?.variantKey ?? null,
    drawerToolId: state.activeDrawerTool?.toolId ?? null,
    panelToolIds: state.activePanelTools.map((item) => item.toolId),
    dataModuleId: state.activeDataModuleId,
    dataModuleCollapsed: state.dataModulePanelCollapsed,
    nonDataModuleRoute,
    nonDataModuleCollapsed: state.activeDockModuleId
      ? state.dockPanelCollapsed
      : state.modulePanelCollapsed,
  }
}

export function workspaceUrlStatesEqual(
  a: MapWorkspaceUrlState,
  b: MapWorkspaceUrlState,
): boolean {
  if (a.mapToolId !== b.mapToolId) return false
  if (a.mapToolVariant !== b.mapToolVariant) return false
  if (a.drawerToolId !== b.drawerToolId) return false
  if (a.dataModuleId !== b.dataModuleId) return false
  if (a.dataModuleCollapsed !== b.dataModuleCollapsed) return false
  if (a.nonDataModuleCollapsed !== b.nonDataModuleCollapsed) return false
  if (a.panelToolIds.length !== b.panelToolIds.length) return false
  if (!a.panelToolIds.every((id, index) => id === b.panelToolIds[index])) return false

  const routeA = a.nonDataModuleRoute
  const routeB = b.nonDataModuleRoute
  if (!routeA && !routeB) return true
  if (!routeA || !routeB) return false
  return routeA.section === routeB.section && routeA.moduleId === routeB.moduleId
}

export function workspaceLocationsEqual(a: WorkspaceLocationState, b: WorkspaceLocationState): boolean {
  if (a.pathname !== b.pathname) return false
  return searchParamsEqual(a.searchParams, b.searchParams)
}

/** 将可分享 query 写入 URLSearchParams（不含 pathname） */
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

  if (state.dataModuleId && state.nonDataModuleRoute) {
    params.set('data', state.dataModuleId)
    if (state.dataModuleCollapsed) {
      params.set('dataDock', 'collapsed')
    }
  } else if (state.dataModuleId && state.dataModuleCollapsed) {
    params.set('dataDock', 'collapsed')
  }

  if (state.nonDataModuleRoute && state.nonDataModuleCollapsed) {
    params.set('dock', 'collapsed')
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
  activeDataModuleNavId: string | null
  activeDataModuleId: string | null
  dataModulePanelCollapsed: boolean
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

  const dataItem = urlState.dataModuleId
    ? findNavSubItemByModuleId(items, urlState.dataModuleId)
    : undefined

  let activeDockModuleNavId: string | null = null
  let activeDockModuleId: string | null = null
  let dockPanelCollapsed = false
  let activeModuleNavId: string | null = null
  let activeModuleId: string | null = null
  let modulePanelCollapsed = false

  if (urlState.nonDataModuleRoute) {
    const nonDataItem = resolveNavItemFromModuleRoute(urlState.nonDataModuleRoute, items)
    if (nonDataItem) {
      if (urlState.nonDataModuleRoute.section === 'uav') {
        activeDockModuleNavId = nonDataItem.id
        activeDockModuleId = nonDataItem.moduleId ?? null
        dockPanelCollapsed = urlState.nonDataModuleCollapsed
      } else {
        activeModuleNavId = nonDataItem.id
        activeModuleId = nonDataItem.moduleId ?? null
        modulePanelCollapsed = urlState.nonDataModuleCollapsed
      }
    }
  }

  return {
    activeMapTool,
    activeDrawerTool,
    activePanelTools,
    activeDataModuleNavId: dataItem?.id ?? null,
    activeDataModuleId: dataItem?.moduleId ?? null,
    dataModulePanelCollapsed: dataItem ? urlState.dataModuleCollapsed : false,
    activeDockModuleNavId,
    activeDockModuleId,
    dockPanelCollapsed,
    activeModuleNavId,
    activeModuleId,
    modulePanelCollapsed,
  }
}
