import { beforeEach, describe, expect, it } from 'vitest'

import { dismissActiveToolsWithPanelMinimize } from './dismiss-active-tools'
import { useMapWorkspaceStore } from '../model/workspace-store'

describe('dismissActiveToolsWithPanelMinimize', () => {
  beforeEach(() => {
    useMapWorkspaceStore.getState().clearAll()
  })

  it('minimizes expanded movable panel before clearing map tool on Esc', () => {
    const store = useMapWorkspaceStore.getState()
    store.toggleMapTool('tool-measure-distance')

    expect(dismissActiveToolsWithPanelMinimize()).toBe(true)
    expect(useMapWorkspaceStore.getState().activeMapTool?.navItemId).toBe('tool-measure-distance')
    expect(useMapWorkspaceStore.getState().minimizedToolPanels['tool-measure-distance']).toBe(true)

    expect(dismissActiveToolsWithPanelMinimize()).toBe(true)
    expect(useMapWorkspaceStore.getState().activeMapTool).toBeNull()
  })
})
