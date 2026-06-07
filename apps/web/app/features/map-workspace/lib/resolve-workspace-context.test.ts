import { describe, expect, it } from 'vitest'

import {
  buildWorkspaceBreadcrumbTrail,
  resolveWorkspaceContext,
} from './resolve-workspace-context'

const idleWorkspaceState = {
  activeMapTool: null,
  activeDrawerTool: null,
  activePanelTools: [],
  activeModuleNavId: null,
  activeModuleId: null,
  modulePanelCollapsed: false,
  activeDockModuleNavId: null,
  activeDockModuleId: null,
  dockPanelCollapsed: false,
  commandPaletteOpen: false,
  globalSearchPopoverOpen: false,
} as const

describe('resolveWorkspaceContext', () => {
  it('returns null labels when workspace is idle', () => {
    expect(resolveWorkspaceContext({ ...idleWorkspaceState })).toEqual({
      sectionLabel: null,
      moduleLabel: '地图工作台',
      contextLabel: null,
      breadcrumbTrail: ['地图工作台'],
      statusSummary: null,
    })
  })

  it('uses active data module for breadcrumb module label', () => {
    const snapshot = resolveWorkspaceContext({
      ...idleWorkspaceState,
      activeModuleNavId: 'module-thematic',
      activeModuleId: 'thematic',
      modulePanelCollapsed: true,
    })

    expect(snapshot.sectionLabel).toBe('图层')
    expect(snapshot.moduleLabel).toBe('专题图层')
  })

  it('uses analysis section label for property view module', () => {
    const snapshot = resolveWorkspaceContext({
      ...idleWorkspaceState,
      activeModuleNavId: 'module-property-view',
      activeModuleId: 'property-view',
      modulePanelCollapsed: false,
    })

    expect(snapshot.sectionLabel).toBe('分析')
    expect(snapshot.moduleLabel).toBe('属性查看')
    expect(snapshot.breadcrumbTrail).toEqual(['分析', '属性查看'])
  })

  it('uses analysis section label for favorites module', () => {
    const snapshot = resolveWorkspaceContext({
      ...idleWorkspaceState,
      activeModuleNavId: 'module-my-favorites',
      activeModuleId: 'my-favorites',
      modulePanelCollapsed: false,
    })

    expect(snapshot.sectionLabel).toBe('分析')
    expect(snapshot.moduleLabel).toBe('我的收藏')
  })

  it('prioritizes active map tool for breadcrumb context', () => {
    const snapshot = resolveWorkspaceContext({
      ...idleWorkspaceState,
      activeMapTool: { navItemId: 'tool-measure-distance', toolId: 'measure-distance' },
      activeDockModuleNavId: 'dock-uav-list',
      activeDockModuleId: 'uav-list',
      dockPanelCollapsed: false,
    })

    expect(snapshot.sectionLabel).toBe('机库')
    expect(snapshot.moduleLabel).toBe('机库列表')
    expect(snapshot.contextLabel).toBe('测距')
    expect(snapshot.breadcrumbTrail).toEqual(['机库', '机库列表', '测距'])
    expect(snapshot.statusSummary).toContain('测距')
    expect(snapshot.statusSummary).toContain('机库列表')
  })

  it('uses global drawer tool as sole breadcrumb when analysis module is also open', () => {
    const snapshot = resolveWorkspaceContext({
      ...idleWorkspaceState,
      activeDrawerTool: { navItemId: 'tool-global-search', toolId: 'global-search' },
      activeModuleNavId: 'module-spatial-analysis',
      activeModuleId: 'spatial-analysis',
      modulePanelCollapsed: false,
    })

    expect(snapshot.contextLabel).toBe('搜索')
    expect(snapshot.breadcrumbTrail).toEqual(['搜索'])
    expect(snapshot.statusSummary).toBe('搜索 · 做分析')
  })

  it('uses single-segment breadcrumb for global search only', () => {
    const snapshot = resolveWorkspaceContext({
      ...idleWorkspaceState,
      activeDrawerTool: { navItemId: 'tool-global-search', toolId: 'global-search' },
    })

    expect(snapshot.breadcrumbTrail).toEqual(['搜索'])
  })

  it('uses search breadcrumb when command palette is open with analysis module', () => {
    const snapshot = resolveWorkspaceContext({
      ...idleWorkspaceState,
      commandPaletteOpen: true,
      activeModuleNavId: 'module-spatial-analysis',
      activeModuleId: 'spatial-analysis',
      modulePanelCollapsed: false,
    })

    expect(snapshot.breadcrumbTrail).toEqual(['搜索'])
    expect(snapshot.statusSummary).toBe('做分析')
  })

  it('uses search breadcrumb when global search popover is open with analysis module', () => {
    const snapshot = resolveWorkspaceContext({
      ...idleWorkspaceState,
      globalSearchPopoverOpen: true,
      activeModuleNavId: 'module-spatial-analysis',
      activeModuleId: 'spatial-analysis',
      modulePanelCollapsed: false,
    })

    expect(snapshot.breadcrumbTrail).toEqual(['搜索'])
  })
})

describe('buildWorkspaceBreadcrumbTrail', () => {
  it('builds section and module trail for business module', () => {
    expect(
      buildWorkspaceBreadcrumbTrail({
        sectionLabel: '图层',
        moduleLabel: '专题图层',
        contextLabel: null,
      }),
    ).toEqual(['图层', '专题图层'])
  })

  it('appends tool context as final segment', () => {
    expect(
      buildWorkspaceBreadcrumbTrail({
        sectionLabel: '图层',
        moduleLabel: '专题图层',
        contextLabel: '测距',
        foregroundTool: { navItemId: 'tool-measure-distance', toolId: 'measure-distance' },
      }),
    ).toEqual(['图层', '专题图层', '测距'])
  })

  it('isolates active drawer tool from module trail', () => {
    expect(
      buildWorkspaceBreadcrumbTrail({
        sectionLabel: '分析',
        moduleLabel: '做分析',
        contextLabel: '搜索',
        activeDrawerTool: { navItemId: 'tool-global-search', toolId: 'global-search' },
      }),
    ).toEqual(['搜索'])
  })

  it('isolates global search surface from module trail', () => {
    expect(
      buildWorkspaceBreadcrumbTrail({
        sectionLabel: '分析',
        moduleLabel: '做分析',
        contextLabel: '做分析',
        globalSearchActive: true,
      }),
    ).toEqual(['搜索'])
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
