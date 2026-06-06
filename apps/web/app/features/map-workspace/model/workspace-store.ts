import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { isDataModuleNavItem, mockNavMainItems, resolveNavToolMeta } from '~/entities/navigation'

import {
  type ActiveDrawerTool,
  type ActiveMapTool,
  type MapWorkspaceUrlState,
  parseWorkspaceUrl,
  resolveWorkspaceStorePatch,
  selectWorkspaceUrlState,
  workspaceUrlStatesEqual,
} from '../lib/workspace-url'

export interface ActivePanelTool {
  navItemId: string
  toolId: string
}

export interface MapWorkspaceStore {
  activeMapTool: ActiveMapTool | null
  activeDrawerTool: ActiveDrawerTool | null
  activePanelTools: ActivePanelTool[]
  activeDataModuleNavId: string | null
  activeDataModuleId: string | null
  dataModulePanelCollapsed: boolean
  dataModulePanelFullscreen: boolean
  activeDockModuleNavId: string | null
  activeDockModuleId: string | null
  dockPanelCollapsed: boolean
  dockPanelFullscreen: boolean
  activeModuleNavId: string | null
  activeModuleId: string | null
  modulePanelCollapsed: boolean
  modulePanelFullscreen: boolean
  /** 左侧上下文列仍占位（含退出动画），收起边缘标签需等其为 false */
  contextPanelPresent: boolean
  globalSearchQuery: string
  globalSearchPopoverOpen: boolean
  commandPaletteOpen: boolean
  commandPaletteQuery: string
  toggleMapTool: (navItemId: string) => void
  clearMapTool: () => void
  clearPanelTools: () => void
  setGlobalSearchQuery: (query: string) => void
  setGlobalSearchPopoverOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setCommandPaletteQuery: (query: string) => void
  openCommandPalette: (query?: string) => void
  closeCommandPalette: () => void
  openGlobalSearchDrawer: () => void
  togglePanelTool: (navItemId: string, toolId: string) => void
  toggleMapDockModule: (navItemId: string, moduleId: string) => void
  closeMapDockModule: () => void
  toggleMapModule: (navItemId: string, moduleId: string) => void
  closeMapModule: () => void
  closeDataModule: () => void
  setDockPanelCollapsed: (collapsed: boolean) => void
  toggleDockPanelFullscreen: () => void
  setDataModulePanelCollapsed: (collapsed: boolean) => void
  toggleDataModulePanelFullscreen: () => void
  setModulePanelCollapsed: (collapsed: boolean) => void
  toggleModulePanelFullscreen: () => void
  setContextPanelPresent: (present: boolean) => void
  applyFromUrl: (urlState: MapWorkspaceUrlState) => void
  clearAll: () => void
}

function readInitialWorkspaceState(): Pick<
  MapWorkspaceStore,
  | 'activeMapTool'
  | 'activeDrawerTool'
  | 'activePanelTools'
  | 'activeDataModuleNavId'
  | 'activeDataModuleId'
  | 'dataModulePanelCollapsed'
  | 'dataModulePanelFullscreen'
  | 'activeDockModuleNavId'
  | 'activeDockModuleId'
  | 'dockPanelCollapsed'
  | 'dockPanelFullscreen'
  | 'activeModuleNavId'
  | 'activeModuleId'
  | 'modulePanelCollapsed'
  | 'modulePanelFullscreen'
> {
  if (typeof window === 'undefined') {
    return {
      activeMapTool: null,
      activeDrawerTool: null,
      activePanelTools: [],
      activeDataModuleNavId: null,
      activeDataModuleId: null,
      dataModulePanelCollapsed: false,
      dataModulePanelFullscreen: false,
      activeDockModuleNavId: null,
      activeDockModuleId: null,
      dockPanelCollapsed: false,
      dockPanelFullscreen: false,
      activeModuleNavId: null,
      activeModuleId: null,
      modulePanelCollapsed: false,
      modulePanelFullscreen: false,
    }
  }

  const patch = resolveWorkspaceStorePatch(
    parseWorkspaceUrl(
      new URLSearchParams(window.location.search),
      window.location.pathname,
    ),
  )
  return {
    activeMapTool: patch.activeMapTool,
    activeDrawerTool: patch.activeDrawerTool,
    activePanelTools: patch.activePanelTools,
    activeDataModuleNavId: patch.activeDataModuleNavId,
    activeDataModuleId: patch.activeDataModuleId,
    dataModulePanelCollapsed: patch.dataModulePanelCollapsed,
    dataModulePanelFullscreen: false,
    activeDockModuleNavId: patch.activeDockModuleNavId,
    activeDockModuleId: patch.activeDockModuleId,
    dockPanelCollapsed: patch.dockPanelCollapsed,
    dockPanelFullscreen: false,
    activeModuleNavId: patch.activeModuleNavId,
    activeModuleId: patch.activeModuleId,
    modulePanelCollapsed: patch.modulePanelCollapsed,
    modulePanelFullscreen: false,
  }
}

function buildMapToolFromNav(navItemId: string): ActiveMapTool | null {
  const meta = resolveNavToolMeta(mockNavMainItems, navItemId)
  if (!meta || meta.coordinatorGroup !== 'mapInteraction') {
    return null
  }
  return {
    navItemId,
    toolId: meta.toolId,
    pluginToolId: meta.pluginToolId,
    variant: meta.variant,
    variantKey: meta.variantKey,
  }
}

function buildDrawerToolFromNav(navItemId: string): ActiveDrawerTool | null {
  const meta = resolveNavToolMeta(mockNavMainItems, navItemId)
  if (!meta || meta.coordinatorGroup !== 'drawer') {
    return null
  }
  return {
    navItemId,
    toolId: meta.toolId,
    pluginToolId: meta.pluginToolId,
  }
}

function clearNonDataModules(): Pick<
  MapWorkspaceStore,
  | 'activeDockModuleNavId'
  | 'activeDockModuleId'
  | 'dockPanelCollapsed'
  | 'dockPanelFullscreen'
  | 'activeModuleNavId'
  | 'activeModuleId'
  | 'modulePanelCollapsed'
  | 'modulePanelFullscreen'
> {
  return {
    activeDockModuleNavId: null,
    activeDockModuleId: null,
    dockPanelCollapsed: false,
    dockPanelFullscreen: false,
    activeModuleNavId: null,
    activeModuleId: null,
    modulePanelCollapsed: false,
    modulePanelFullscreen: false,
  }
}

export const useMapWorkspaceStore = create<MapWorkspaceStore>((set, get) => ({
  ...readInitialWorkspaceState(),
  contextPanelPresent: false,
  globalSearchQuery: '',
  globalSearchPopoverOpen: false,
  commandPaletteOpen: false,
  commandPaletteQuery: '',

  setCommandPaletteOpen(open) {
    set({ commandPaletteOpen: open })
  },

  setCommandPaletteQuery(query) {
    set({ commandPaletteQuery: query })
  },

  openCommandPalette(query = '') {
    set({
      commandPaletteOpen: true,
      commandPaletteQuery: query,
      globalSearchPopoverOpen: false,
    })
  },

  closeCommandPalette() {
    set({ commandPaletteOpen: false })
  },

  setGlobalSearchQuery(query) {
    set({ globalSearchQuery: query })
  },

  setGlobalSearchPopoverOpen(open) {
    set({ globalSearchPopoverOpen: open })
  },

  openGlobalSearchDrawer() {
    const { activeDrawerTool } = get()
    if (activeDrawerTool?.navItemId !== 'tool-global-search') {
      get().toggleMapTool('tool-global-search')
    }
  },

  toggleMapTool(navItemId) {
    const meta = resolveNavToolMeta(mockNavMainItems, navItemId)
    if (!meta) {
      return
    }

    if (meta.coordinatorGroup === 'drawer') {
      const { activeDrawerTool } = get()
      if (activeDrawerTool?.navItemId === navItemId) {
        set({ activeDrawerTool: null })
        return
      }
      const drawer = buildDrawerToolFromNav(navItemId)
      set({
        activeDrawerTool: drawer,
        activeMapTool: null,
      })
      return
    }

    const { activeMapTool } = get()
    if (activeMapTool?.navItemId === navItemId) {
      set({ activeMapTool: null })
      return
    }

    const next = buildMapToolFromNav(navItemId)
    set({
      activeMapTool: next,
      activeDrawerTool: null,
    })
  },

  clearMapTool() {
    set({ activeMapTool: null, activeDrawerTool: null })
  },

  clearPanelTools() {
    set({ activePanelTools: [] })
  },

  togglePanelTool(navItemId, toolId) {
    const { activePanelTools } = get()
    const exists = activePanelTools.some((item) => item.navItemId === navItemId)
    if (exists) {
      set({ activePanelTools: activePanelTools.filter((item) => item.navItemId !== navItemId) })
      return
    }
    set({ activePanelTools: [...activePanelTools, { navItemId, toolId }] })
  },

  toggleMapDockModule(navItemId, moduleId) {
    const { activeDockModuleNavId, dockPanelCollapsed } = get()
    if (activeDockModuleNavId === navItemId) {
      if (dockPanelCollapsed) {
        set({ dockPanelCollapsed: false })
        return
      }
      get().closeMapDockModule()
      return
    }
    set({
      ...clearNonDataModules(),
      activeDockModuleNavId: navItemId,
      activeDockModuleId: moduleId,
      dockPanelCollapsed: false,
      dockPanelFullscreen: false,
    })
  },

  closeMapDockModule() {
    set(clearNonDataModules())
  },

  toggleMapModule(navItemId, moduleId) {
    if (isDataModuleNavItem(navItemId)) {
      const { activeDataModuleNavId, dataModulePanelCollapsed } = get()
      if (activeDataModuleNavId === navItemId) {
        if (dataModulePanelCollapsed) {
          set({ dataModulePanelCollapsed: false })
          return
        }
        get().closeDataModule()
        return
      }
      set({
        activeDataModuleNavId: navItemId,
        activeDataModuleId: moduleId,
        dataModulePanelCollapsed: false,
        dataModulePanelFullscreen: false,
      })
      return
    }

    const { activeModuleNavId, modulePanelCollapsed } = get()
    if (activeModuleNavId === navItemId) {
      if (modulePanelCollapsed) {
        set({ modulePanelCollapsed: false })
        return
      }
      get().closeMapModule()
      return
    }
    set({
      ...clearNonDataModules(),
      activeModuleNavId: navItemId,
      activeModuleId: moduleId,
      modulePanelCollapsed: false,
      modulePanelFullscreen: false,
    })
  },

  closeMapModule() {
    set(clearNonDataModules())
  },

  closeDataModule() {
    set({
      activeDataModuleNavId: null,
      activeDataModuleId: null,
      dataModulePanelCollapsed: false,
      dataModulePanelFullscreen: false,
    })
  },

  setDockPanelCollapsed(collapsed) {
    set({
      dockPanelCollapsed: collapsed,
      ...(collapsed ? { dockPanelFullscreen: false } : {}),
    })
  },

  toggleDockPanelFullscreen() {
    const next = !get().dockPanelFullscreen
    set({
      dockPanelFullscreen: next,
      ...(next ? { modulePanelFullscreen: false, dockPanelCollapsed: false } : {}),
    })
  },

  setDataModulePanelCollapsed(collapsed) {
    set({
      dataModulePanelCollapsed: collapsed,
      ...(collapsed ? { dataModulePanelFullscreen: false } : {}),
    })
  },

  toggleDataModulePanelFullscreen() {
    const next = !get().dataModulePanelFullscreen
    set({
      dataModulePanelFullscreen: next,
      ...(next ? { modulePanelFullscreen: false, dataModulePanelCollapsed: false } : {}),
    })
  },

  setModulePanelCollapsed(collapsed) {
    set({
      modulePanelCollapsed: collapsed,
      ...(collapsed ? { modulePanelFullscreen: false } : {}),
    })
  },

  toggleModulePanelFullscreen() {
    const next = !get().modulePanelFullscreen
    set({
      modulePanelFullscreen: next,
      ...(next ? { dockPanelFullscreen: false, modulePanelCollapsed: false } : {}),
    })
  },

  setContextPanelPresent(present) {
    set({ contextPanelPresent: present })
  },

  applyFromUrl(urlState) {
    const patch = resolveWorkspaceStorePatch(urlState)
    const current = get()
    const nextUrlState = selectWorkspaceUrlState({
      activeMapTool: patch.activeMapTool,
      activeDrawerTool: patch.activeDrawerTool,
      activePanelTools: patch.activePanelTools,
      activeDataModuleId: patch.activeDataModuleId,
      dataModulePanelCollapsed: patch.dataModulePanelCollapsed,
      activeDockModuleId: patch.activeDockModuleId,
      dockPanelCollapsed: patch.dockPanelCollapsed,
      activeModuleId: patch.activeModuleId,
      modulePanelCollapsed: patch.modulePanelCollapsed,
    })
    const currentUrlState = selectWorkspaceUrlState(current)
    if (workspaceUrlStatesEqual(nextUrlState, currentUrlState)) {
      return
    }
    set({
      activeMapTool: patch.activeMapTool,
      activeDrawerTool: patch.activeDrawerTool,
      activePanelTools: patch.activePanelTools,
      activeDataModuleNavId: patch.activeDataModuleNavId,
      activeDataModuleId: patch.activeDataModuleId,
      dataModulePanelCollapsed: patch.dataModulePanelCollapsed,
      activeDockModuleNavId: patch.activeDockModuleNavId,
      activeDockModuleId: patch.activeDockModuleId,
      dockPanelCollapsed: patch.dockPanelCollapsed,
      activeModuleNavId: patch.activeModuleNavId,
      activeModuleId: patch.activeModuleId,
      modulePanelCollapsed: patch.modulePanelCollapsed,
    })
  },

  clearAll() {
    set({
      activeMapTool: null,
      activeDrawerTool: null,
      activePanelTools: [],
      activeDataModuleNavId: null,
      activeDataModuleId: null,
      dataModulePanelCollapsed: false,
      dataModulePanelFullscreen: false,
      activeDockModuleNavId: null,
      activeDockModuleId: null,
      dockPanelCollapsed: false,
      dockPanelFullscreen: false,
      activeModuleNavId: null,
      activeModuleId: null,
      modulePanelCollapsed: false,
      modulePanelFullscreen: false,
      contextPanelPresent: false,
    })
  },
}))

export function selectActiveNavItemIds(state: MapWorkspaceStore): string[] {
  const ids: string[] = []
  if (state.activeMapTool) {
    ids.push(state.activeMapTool.navItemId)
  }
  if (state.activeDrawerTool) {
    ids.push(state.activeDrawerTool.navItemId)
  }
  ids.push(...state.activePanelTools.map((item) => item.navItemId))
  if (state.activeDataModuleNavId) {
    ids.push(state.activeDataModuleNavId)
  }
  if (state.activeDockModuleNavId) {
    ids.push(state.activeDockModuleNavId)
  }
  if (state.activeModuleNavId) {
    ids.push(state.activeModuleNavId)
  }
  return ids
}

export function useActiveNavItemIds(): string[] {
  return useMapWorkspaceStore(useShallow(selectActiveNavItemIds))
}
