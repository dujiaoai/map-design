import { describe, expect, it } from 'vitest'

import {
  buildWorkspaceBreadcrumbTrail,
  resolveWorkspaceContext,
} from './resolve-workspace-context'

describe('resolveWorkspaceContext', () => {
  it('returns null labels when workspace is idle', () => {
    expect(
      resolveWorkspaceContext({
        activeMapTool: null,
        activeDrawerTool: null,
        activePanelTools: [],
        activeDataModuleNavId: null,
        activeDataModuleId: null,
        dataModulePanelCollapsed: false,
        activeDockModuleNavId: null,
        activeDockModuleId: null,
        dockPanelCollapsed: false,
        activeModuleNavId: null,
        activeModuleId: null,
        modulePanelCollapsed: false,
      }),
    ).toEqual({
      sectionLabel: null,
      moduleLabel: '地图工作台',
      contextLabel: null,
      statusSummary: null,
    })
  })

  it('uses active data module for breadcrumb module label', () => {
    const snapshot = resolveWorkspaceContext({
      activeMapTool: null,
      activeDrawerTool: null,
      activePanelTools: [],
      activeDataModuleNavId: 'module-thematic',
      activeDataModuleId: 'thematic',
      dataModulePanelCollapsed: true,
      activeDockModuleNavId: null,
      activeDockModuleId: null,
      dockPanelCollapsed: false,
      activeModuleNavId: null,
      activeModuleId: null,
      modulePanelCollapsed: false,
    })

    expect(snapshot.sectionLabel).toBe('数据')
    expect(snapshot.moduleLabel).toBe('专题')
  })

  it('prioritizes active map tool for breadcrumb context', () => {
    const snapshot = resolveWorkspaceContext({
      activeMapTool: { navItemId: 'tool-measure-distance', toolId: 'measure-distance' },
      activeDrawerTool: null,
      activePanelTools: [],
      activeDataModuleNavId: null,
      activeDataModuleId: null,
      dataModulePanelCollapsed: false,
      activeDockModuleNavId: 'dock-uav-list',
      activeDockModuleId: 'uav-list',
      dockPanelCollapsed: false,
      activeModuleNavId: null,
      activeModuleId: null,
      modulePanelCollapsed: false,
    })

    expect(snapshot.sectionLabel).toBe('机库')
    expect(snapshot.moduleLabel).toBe('机库列表')
    expect(snapshot.contextLabel).toBe('测距')
    expect(snapshot.statusSummary).toContain('测距')
    expect(snapshot.statusSummary).toContain('机库列表')
  })
})

describe('buildWorkspaceBreadcrumbTrail', () => {
  it('builds section and module trail for business module', () => {
    expect(
      buildWorkspaceBreadcrumbTrail({
        sectionLabel: '数据',
        moduleLabel: '专题',
        contextLabel: null,
      }),
    ).toEqual(['数据', '专题'])
  })

  it('appends tool context as final segment', () => {
    expect(
      buildWorkspaceBreadcrumbTrail({
        sectionLabel: '数据',
        moduleLabel: '专题',
        contextLabel: '测距',
      }),
    ).toEqual(['数据', '专题', '测距'])
  })

  it('falls back to workspace label when no section', () => {
    expect(
      buildWorkspaceBreadcrumbTrail({
        sectionLabel: null,
        moduleLabel: '地图工作台',
        contextLabel: null,
      }),
    ).toEqual(['地图工作台'])
  })
})
