import { describe, expect, it } from 'vitest'

import {
  resolveModuleSurfaceDirection,
  resolveVisibleModuleSurfaceKey,
} from './workspace-module-surface'

describe('workspace-module-surface', () => {
  it('resolves visible surface for single data module', () => {
    expect(
      resolveVisibleModuleSurfaceKey({
        tab: 'data',
        showTabs: false,
        activeDataModuleId: 'thematic',
        activeDockModuleId: null,
        activeModuleId: null,
        dataOpen: true,
        workspaceOpen: false,
        workspaceIsUav: false,
      }),
    ).toBe('data:thematic')
  })

  it('resolves workspace surface when uav is active', () => {
    expect(
      resolveVisibleModuleSurfaceKey({
        tab: 'workspace',
        showTabs: false,
        activeDataModuleId: null,
        activeDockModuleId: 'uav-list',
        activeModuleId: null,
        dataOpen: false,
        workspaceOpen: true,
        workspaceIsUav: true,
      }),
    ).toBe('uav:uav-list')
  })

  it('uses tab selection when data and workspace are both open', () => {
    expect(
      resolveVisibleModuleSurfaceKey({
        tab: 'workspace',
        showTabs: true,
        activeDataModuleId: 'thematic',
        activeDockModuleId: 'uav-list',
        activeModuleId: null,
        dataOpen: true,
        workspaceOpen: true,
        workspaceIsUav: true,
      }),
    ).toBe('uav:uav-list')
  })

  it('derives motion direction from section order', () => {
    expect(resolveModuleSurfaceDirection('uav:uav-list', 'ops:view-project')).toBe('forward')
    expect(resolveModuleSurfaceDirection('ops:view-project', 'data:thematic')).toBe('back')
  })
})
