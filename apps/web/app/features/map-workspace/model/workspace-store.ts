import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import { mockNavMainItems, resolveNavToolMeta } from '~/entities/navigation'

import {
  type ActiveDrawerTool,
  type ActiveMapTool,
  type MapWorkspaceUrlState,
  parseWorkspaceUrl,
  resolveWorkspaceStorePatch,
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
  activeDockModuleNavId: string | null
  activeDockModuleId: string | null
  dockPanelCollapsed: boolean
  dockPanelFullscreen: boolean
  activeModuleNavId: string | null
  activeModuleId: string | null
  modulePanelCollapsed: boolean
  modulePanelFullscreen: boolean
  globalSearchQuery: string
  globalSearchPopoverOpen: boolean
  toggleMapTool: (navItemId: string) => void
  clearMapTool: () => void
  setGlobalSearchQuery: (query: string) => void
  setGlobalSearchPopoverOpen: (open: boolean) => void
  openGlobalSearchDrawer: () => void
  togglePanelTool: (navItemId: string, toolId: string) => void
  toggleMapDockModule: (navItemId: string, moduleId: string) => void
  closeMapDockModule: () => void
  toggleMapModule: (navItemId: string, moduleId: string) => void
  closeMapModule: () => void
  setDockPanelCollapsed: (collapsed: boolean) => void
  toggleDockPanelFullscreen: () => void
  setModulePanelCollapsed: (collapsed: boolean) => void
  toggleModulePanelFullscreen: () => void
  applyFromUrl: (urlState: MapWorkspaceUrlState) => void
  clearAll: () => void
}

function readInitialWorkspaceState(): Pick<
  MapWorkspaceStore,
  | 'activeMapTool'
  | 'activeDrawerTool'
  | 'activePanelTools'
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
    parseWorkspaceUrl(new URLSearchParams(window.location.search)),
  )
  return {
    activeMapTool: patch.activeMapTool,
    activeDrawerTool: patch.activeDrawerTool,
    activePanelTools: patch.activePanelTools,
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

export const useMapWorkspaceStore = create<MapWorkspaceStore>((set, get) => ({
  ...readInitialWorkspaceState(),
  globalSearchQuery: '',
  globalSearchPopoverOpen: false,

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
      activeDockModuleNavId: navItemId,
      activeDockModuleId: moduleId,
      dockPanelCollapsed: false,
      dockPanelFullscreen: false,
    })
  },

  closeMapDockModule() {
    set({
      activeDockModuleNavId: null,
      activeDockModuleId: null,
      dockPanelCollapsed: false,
      dockPanelFullscreen: false,
    })
  },

  toggleMapModule(navItemId, moduleId) {
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
      activeModuleNavId: navItemId,
      activeModuleId: moduleId,
      modulePanelCollapsed: false,
      modulePanelFullscreen: false,
    })
  },

  closeMapModule() {
    set({
      activeModuleNavId: null,
      activeModuleId: null,
      modulePanelCollapsed: false,
      modulePanelFullscreen: false,
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

  applyFromUrl(urlState) {
    const patch = resolveWorkspaceStorePatch(urlState)
    const current = get()
    const nextUrlState: MapWorkspaceUrlState = {
      mapToolId: patch.activeMapTool?.toolId ?? null,
      mapToolVariant: patch.activeMapTool?.variantKey ?? null,
      drawerToolId: patch.activeDrawerTool?.toolId ?? null,
      panelToolIds: patch.activePanelTools.map((item) => item.toolId),
      dockModuleId: patch.activeDockModuleId,
      dockPanelCollapsed: patch.dockPanelCollapsed,
      moduleId: patch.activeModuleId,
      modulePanelCollapsed: patch.modulePanelCollapsed,
    }
    const currentUrlState: MapWorkspaceUrlState = {
      mapToolId: current.activeMapTool?.toolId ?? null,
      mapToolVariant: current.activeMapTool?.variantKey ?? null,
      drawerToolId: current.activeDrawerTool?.toolId ?? null,
      panelToolIds: current.activePanelTools.map((item) => item.toolId),
      dockModuleId: current.activeDockModuleId,
      dockPanelCollapsed: current.dockPanelCollapsed,
      moduleId: current.activeModuleId,
      modulePanelCollapsed: current.modulePanelCollapsed,
    }
    if (workspaceUrlStatesEqual(nextUrlState, currentUrlState)) {
      return
    }
    set({
      activeMapTool: patch.activeMapTool,
      activeDrawerTool: patch.activeDrawerTool,
      activePanelTools: patch.activePanelTools,
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
      activeDockModuleNavId: null,
      activeDockModuleId: null,
      dockPanelCollapsed: false,
      dockPanelFullscreen: false,
      activeModuleNavId: null,
      activeModuleId: null,
      modulePanelCollapsed: false,
      modulePanelFullscreen: false,
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
