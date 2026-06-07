import { beforeEach, describe, expect, it } from 'vitest'

import {
  selectActiveNavItemIds,
  selectActiveSidebarModuleNavId,
  useMapWorkspaceStore,
} from './workspace-store'

/** 四段侧栏模块：图层 / 分析 / 运营 / 机库 */
const SIDEBAR_MODULE_CASES = [
  ['module-thematic', 'thematic', 'layers'],
  ['module-legend', 'legend', 'layers'],
  ['module-spatial-analysis', 'spatial-analysis', 'analysis'],
  ['module-view-project', 'view-project', 'ops'],
  ['dock-uav-list', 'uav-list', 'uav'],
] as const

describe('useMapWorkspaceStore sidebar module mutual exclusion', () => {
  beforeEach(() => {
    useMapWorkspaceStore.getState().clearAll()
  })

  it.each(SIDEBAR_MODULE_CASES)(
    'opens %s and clears any previously active sidebar module',
    (navItemId, moduleId) => {
      const store = useMapWorkspaceStore.getState()
      if (navItemId.startsWith('dock-')) {
        store.toggleMapModule('module-thematic', 'thematic')
        store.toggleMapDockModule(navItemId, moduleId)
      } else if (navItemId === 'module-thematic') {
        store.toggleMapDockModule('dock-uav-list', 'uav-list')
        store.toggleMapModule(navItemId, moduleId)
      } else {
        store.toggleMapModule('module-thematic', 'thematic')
        store.toggleMapModule(navItemId, moduleId)
      }

      const state = useMapWorkspaceStore.getState()
      expect(selectActiveSidebarModuleNavId(state)).toBe(navItemId)
      const activeSlots = [state.activeDockModuleNavId, state.activeModuleNavId].filter(Boolean)
      expect(activeSlots).toHaveLength(1)
    },
  )

  it('clears map tools when opening a sidebar module', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapTool('tool-measure-distance')
    store.togglePanelTool('tool-hd-image-compare', 'hd-image-compare')
    store.toggleMapModule('module-thematic', 'thematic')

    const state = useMapWorkspaceStore.getState()
    expect(state.activeMapTool).toBeNull()
    expect(state.activeDrawerTool).toBeNull()
    expect(state.activePanelTools).toEqual([])
    expect(state.activeModuleId).toBe('thematic')
  })

  it('does not clear map tools when re-expanding a collapsed module', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapModule('module-thematic', 'thematic')
    store.setModulePanelCollapsed(true)
    store.toggleMapTool('tool-measure-distance')
    store.toggleMapModule('module-thematic', 'thematic')

    const state = useMapWorkspaceStore.getState()
    expect(state.activeMapTool?.navItemId).toBe('tool-measure-distance')
    expect(state.activeModuleId).toBe('thematic')
    expect(state.modulePanelCollapsed).toBe(false)
  })

  it('exposes at most one sidebar module id in active nav ids', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapModule('module-flight-ledger', 'flight-ledger')
    const ids = selectActiveNavItemIds(useMapWorkspaceStore.getState())
    const sidebarIds = ids.filter((id) => id.startsWith('module-') || id.startsWith('dock-'))
    expect(sidebarIds).toEqual(['module-flight-ledger'])
  })
})

describe('useMapWorkspaceStore parallel panel tools', () => {
  beforeEach(() => {
    useMapWorkspaceStore.getState().clearAll()
  })

  it.each([
    ['tool-hd-image-compare', 'hd-image-compare'],
    ['tool-swipe-compare', 'swipe-compare'],
  ] as const)('keeps %s open when activating another map tool', (navItemId, toolId) => {
    const store = useMapWorkspaceStore.getState()
    store.togglePanelTool(navItemId, toolId)
    store.toggleMapTool('tool-measure-distance')

    expect(useMapWorkspaceStore.getState().activePanelTools).toEqual([{ navItemId, toolId }])
    expect(useMapWorkspaceStore.getState().activeMapTool?.navItemId).toBe('tool-measure-distance')
  })

  it('only closes parallel panel via panel toggle', () => {
    const store = useMapWorkspaceStore.getState()
    store.togglePanelTool('tool-hd-image-compare', 'hd-image-compare')
    store.toggleMapTool('tool-measure-distance')
    store.clearMapTool()

    expect(useMapWorkspaceStore.getState().activePanelTools).toHaveLength(1)
    expect(useMapWorkspaceStore.getState().activeMapTool).toBeNull()

    store.togglePanelTool('tool-hd-image-compare', 'hd-image-compare')
    expect(useMapWorkspaceStore.getState().activePanelTools).toEqual([])
  })

  it('closes non-data modules when opening another non-data module', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapDockModule('dock-uav-list', 'uav-list')
    store.toggleMapModule('module-view-project', 'view-project')

    expect(useMapWorkspaceStore.getState().activeDockModuleId).toBeNull()
    expect(useMapWorkspaceStore.getState().activeModuleId).toBe('view-project')
  })

  it('closes workspace module when opening dock module', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapModule('module-thematic', 'thematic')
    store.toggleMapDockModule('dock-uav-list', 'uav-list')

    expect(useMapWorkspaceStore.getState().activeModuleId).toBeNull()
    expect(useMapWorkspaceStore.getState().activeDockModuleId).toBe('uav-list')
  })

  it('closes ops module when opening data module', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapModule('module-view-project', 'view-project')
    store.toggleMapModule('module-thematic', 'thematic')

    expect(useMapWorkspaceStore.getState().activeModuleId).toBe('thematic')
  })

  it('closes data module when opening ops module', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapModule('module-thematic', 'thematic')
    store.toggleMapModule('module-flight-ledger', 'flight-ledger')

    expect(useMapWorkspaceStore.getState().activeModuleId).toBe('flight-ledger')
  })

  it('keeps panel tools when opening drawer tool', () => {
    const store = useMapWorkspaceStore.getState()
    store.togglePanelTool('tool-hd-image-compare', 'hd-image-compare')
    store.toggleMapTool('tool-import-file')

    expect(useMapWorkspaceStore.getState().activePanelTools).toEqual([
      { navItemId: 'tool-hd-image-compare', toolId: 'hd-image-compare' },
    ])
    expect(useMapWorkspaceStore.getState().activeDrawerTool?.toolId).toBe('import-file')
    expect(useMapWorkspaceStore.getState().activeMapTool).toBeNull()
  })
})
