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
