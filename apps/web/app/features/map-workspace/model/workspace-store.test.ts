import { beforeEach, describe, expect, it } from 'vitest'

import { useMapWorkspaceStore } from './workspace-store'

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

  it('keeps data module open when opening non-data module', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapModule('module-thematic', 'thematic')
    store.toggleMapDockModule('dock-uav-list', 'uav-list')

    expect(useMapWorkspaceStore.getState().activeDataModuleId).toBe('thematic')
    expect(useMapWorkspaceStore.getState().activeDockModuleId).toBe('uav-list')
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
