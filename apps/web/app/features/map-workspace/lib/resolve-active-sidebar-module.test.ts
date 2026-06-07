import { describe, expect, it } from 'vitest'

import {
  resolveActiveSidebarModule,
  resolveCollapsedSidebarModule,
  resolveNativeSidebarModule,
  resolveOpenSidebarModule,
  resolveSidebarModuleSurfaceKey,
} from './resolve-active-sidebar-module'

describe('resolve-active-sidebar-module', () => {
  it('returns the single expanded left-panel module', () => {
    expect(
      resolveActiveSidebarModule({
        activeDockModuleId: null,
        dockPanelCollapsed: false,
        activeModuleId: 'thematic',
        modulePanelCollapsed: false,
      }),
    ).toEqual({ kind: 'workspace', moduleId: 'thematic' })
  })

  it('routes modify-panel modules to left panel and display to native carrier', () => {
    const modifyState = {
      activeDockModuleId: null,
      dockPanelCollapsed: false,
      activeModuleId: 'view-project',
      modulePanelCollapsed: false,
    }
    expect(resolveOpenSidebarModule(modifyState)).toEqual({
      kind: 'workspace',
      moduleId: 'view-project',
    })
    expect(resolveActiveSidebarModule(modifyState)).toEqual({
      kind: 'workspace',
      moduleId: 'view-project',
    })
    expect(resolveNativeSidebarModule(modifyState)).toBeNull()

    const displayState = {
      activeDockModuleId: null,
      dockPanelCollapsed: false,
      activeModuleId: 'flight-ledger',
      modulePanelCollapsed: false,
    }
    expect(resolveActiveSidebarModule(displayState)).toBeNull()
    expect(resolveNativeSidebarModule(displayState)).toEqual({
      kind: 'workspace',
      moduleId: 'flight-ledger',
    })
  })

  it('resolves uav on left panel', () => {
    expect(
      resolveActiveSidebarModule({
        activeDockModuleId: 'uav-list',
        dockPanelCollapsed: false,
        activeModuleId: null,
        modulePanelCollapsed: false,
      }),
    ).toEqual({ kind: 'uav', moduleId: 'uav-list' })
  })

  it('resolves collapsed module for edge expand', () => {
    expect(
      resolveCollapsedSidebarModule({
        activeDockModuleId: null,
        dockPanelCollapsed: false,
        activeModuleId: 'view-project',
        modulePanelCollapsed: true,
      }),
    ).toEqual({ kind: 'workspace', moduleId: 'view-project' })
  })

  it('maps surface key by kind', () => {
    expect(resolveSidebarModuleSurfaceKey({ kind: 'workspace', moduleId: 'thematic' })).toBe(
      'data:thematic',
    )
    expect(resolveSidebarModuleSurfaceKey({ kind: 'workspace', moduleId: 'view-project' })).toBe(
      'ops:view-project',
    )
  })
})
