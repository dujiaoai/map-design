import { describe, expect, it } from 'vitest'

import {
  buildWorkspaceSearchParams,
  parseWorkspaceUrl,
  resolveWorkspaceStorePatch,
  searchParamsEqual,
} from './workspace-url'

describe('workspace-url', () => {
  it('parseWorkspaceUrl 忽略未知 tool / module / uav', () => {
    const params = new URLSearchParams(
      'tool=unknown&panels=fake&module=view-project&dock=collapsed&uav=fake&uavDock=collapsed',
    )
    expect(parseWorkspaceUrl(params)).toEqual({
      mapToolId: null,
      mapToolVariant: null,
      drawerToolId: null,
      panelToolIds: [],
      dockModuleId: null,
      dockPanelCollapsed: false,
      moduleId: 'view-project',
      modulePanelCollapsed: true,
    })
  })

  it('buildWorkspaceSearchParams 与 parse 互逆（地图工具 + variant）', () => {
    const state = {
      mapToolId: 'measure-distance',
      mapToolVariant: 'drawLine' as const,
      drawerToolId: null,
      panelToolIds: [],
      dockModuleId: 'uav-list',
      dockPanelCollapsed: false,
      moduleId: 'spatial-analysis',
      modulePanelCollapsed: false,
    }
    const params = buildWorkspaceSearchParams(state)
    expect(parseWorkspaceUrl(params)).toEqual(state)
  })

  it('导入工具写入 drawerToolId 语义（tool=import-file）', () => {
    const params = buildWorkspaceSearchParams({
      mapToolId: null,
      mapToolVariant: null,
      drawerToolId: 'import-file',
      panelToolIds: [],
      dockModuleId: null,
      dockPanelCollapsed: false,
      moduleId: null,
      modulePanelCollapsed: false,
    })
    expect(params.get('tool')).toBe('import-file')
    const parsed = parseWorkspaceUrl(params)
    expect(parsed.drawerToolId).toBe('import-file')
    expect(parsed.mapToolId).toBeNull()
  })

  it('机库与地图业务可同时写入 URL', () => {
    const params = buildWorkspaceSearchParams({
      mapToolId: 'plot-point',
      mapToolVariant: null,
      drawerToolId: null,
      panelToolIds: [],
      dockModuleId: 'uav-list',
      dockPanelCollapsed: true,
      moduleId: 'view-project',
      modulePanelCollapsed: false,
    })
    expect(params.get('uav')).toBe('uav-list')
    expect(params.get('uavDock')).toBe('collapsed')
    expect(params.get('module')).toBe('view-project')
    expect(params.get('tool')).toBe('plot-point')
  })

  it('空状态不写入 query', () => {
    const params = buildWorkspaceSearchParams({
      mapToolId: null,
      mapToolVariant: null,
      drawerToolId: null,
      panelToolIds: [],
      dockModuleId: null,
      dockPanelCollapsed: false,
      moduleId: null,
      modulePanelCollapsed: false,
    })
    expect(params.toString()).toBe('')
  })

  it('resolveWorkspaceStorePatch 映射 navItemId 与 variant', () => {
    const patch = resolveWorkspaceStorePatch({
      mapToolId: 'measure-distance',
      mapToolVariant: 'drawLine',
      drawerToolId: null,
      panelToolIds: [],
      dockModuleId: 'uav-collect',
      dockPanelCollapsed: true,
      moduleId: 'view-project',
      modulePanelCollapsed: true,
    })
    expect(patch.activeMapTool).toMatchObject({
      navItemId: 'tool-draw-line',
      toolId: 'measure-distance',
      pluginToolId: 'measure-distance-plugin',
      variantKey: 'drawLine',
    })
    expect(patch.activeDrawerTool).toBeNull()
    expect(patch.activeDockModuleNavId).toBe('dock-uav-collect')
    expect(patch.dockPanelCollapsed).toBe(true)
    expect(patch.activeModuleNavId).toBe('module-view-project')
    expect(patch.modulePanelCollapsed).toBe(true)
  })

  it('searchParamsEqual 忽略无关 query', () => {
    const a = new URLSearchParams('tool=plot-point&foo=bar')
    const b = new URLSearchParams('tool=plot-point&baz=1')
    expect(searchParamsEqual(a, b)).toBe(true)
  })

  it('并行 panel 工具可与 mapTool 同时写入 URL', () => {
    const state = {
      mapToolId: 'measure-distance',
      mapToolVariant: null,
      drawerToolId: null,
      panelToolIds: ['hd-image-compare'],
      dockModuleId: null,
      dockPanelCollapsed: false,
      moduleId: null,
      modulePanelCollapsed: false,
    }
    const params = buildWorkspaceSearchParams(state)
    expect(params.get('tool')).toBe('measure-distance')
    expect(params.get('panels')).toBe('hd-image-compare')
    expect(parseWorkspaceUrl(params)).toEqual(state)

    const patch = resolveWorkspaceStorePatch(state)
    expect(patch.activeMapTool?.toolId).toBe('measure-distance')
    expect(patch.activePanelTools).toEqual([
      { navItemId: 'tool-hd-image-compare', toolId: 'hd-image-compare' },
    ])
  })
})
