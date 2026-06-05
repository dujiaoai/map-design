import { describe, expect, it } from 'vitest'

import { resolveWorkspaceContext } from './resolve-workspace-context'

describe('resolveWorkspaceContext', () => {
  it('returns null labels when workspace is idle', () => {
    expect(
      resolveWorkspaceContext({
        activeMapTool: null,
        activeDrawerTool: null,
        activePanelTools: [],
        activeDockModuleNavId: null,
        activeDockModuleId: null,
        dockPanelCollapsed: false,
        activeModuleNavId: null,
        activeModuleId: null,
        modulePanelCollapsed: false,
      }),
    ).toEqual({
      contextLabel: null,
      statusSummary: null,
    })
  })

  it('prioritizes active map tool for breadcrumb context', () => {
    const snapshot = resolveWorkspaceContext({
      activeMapTool: { navItemId: 'tool-measure-distance', toolId: 'measure-distance' },
      activeDrawerTool: null,
      activePanelTools: [],
      activeDockModuleNavId: 'uav-list',
      activeDockModuleId: 'uav-list',
      dockPanelCollapsed: false,
      activeModuleNavId: null,
      activeModuleId: null,
      modulePanelCollapsed: false,
    })

    expect(snapshot.contextLabel).toBe('测距')
    expect(snapshot.statusSummary).toContain('测距')
    expect(snapshot.statusSummary).toContain('机库列表')
  })
})
