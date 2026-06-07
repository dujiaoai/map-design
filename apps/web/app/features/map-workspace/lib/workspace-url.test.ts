import { describe, expect, it } from 'vitest'

import {
  buildWorkspaceSearchParams,
  parseWorkspaceUrl,
  resolveWorkspaceStorePatch,
  searchParamsEqual,
  selectWorkspaceLocation,
  workspaceLocationsEqual,
} from './workspace-url'

describe('workspace-url', () => {
  it('parseWorkspaceUrl 忽略未知 tool / 非数据子路由', () => {
    const params = new URLSearchParams('tool=unknown&panels=fake&data=fake&dock=collapsed')
    expect(parseWorkspaceUrl(params, '/ops/view-project')).toEqual({
      mapToolId: null,
      mapToolVariant: null,
      drawerToolId: null,
      panelToolIds: [],
      dataModuleId: null,
      dataModuleCollapsed: false,
      nonDataModuleRoute: { section: 'ops', moduleId: 'view-project' },
      nonDataModuleCollapsed: true,
    })
  })

  it('buildWorkspaceSearchParams 与 parse 互逆（地图工具 + variant + 子路由）', () => {
    const state = {
      mapToolId: 'measure-distance',
      mapToolVariant: 'drawLine' as const,
      drawerToolId: null,
      panelToolIds: [],
      dataModuleId: null,
      dataModuleCollapsed: false,
      nonDataModuleRoute: { section: 'uav' as const, moduleId: 'uav-list' },
      nonDataModuleCollapsed: false,
    }
    const params = buildWorkspaceSearchParams(state)
    expect(parseWorkspaceUrl(params, '/uav/uav-list')).toEqual(state)
  })

  it('导入工具写入 drawerToolId 语义（tool=import-file）', () => {
    const params = buildWorkspaceSearchParams({
      mapToolId: null,
      mapToolVariant: null,
      drawerToolId: 'import-file',
      panelToolIds: [],
      dataModuleId: null,
      dataModuleCollapsed: false,
      nonDataModuleRoute: null,
      nonDataModuleCollapsed: false,
    })
    expect(params.get('tool')).toBe('import-file')
    const parsed = parseWorkspaceUrl(params)
    expect(parsed.drawerToolId).toBe('import-file')
    expect(parsed.mapToolId).toBeNull()
  })

  it('数据段子路由解析', () => {
    const parsed = parseWorkspaceUrl(new URLSearchParams(), '/data/spatial-analysis')
    expect(parsed.dataModuleId).toBe('spatial-analysis')
    expect(parsed.nonDataModuleRoute).toBeNull()
  })

  it('数据段收起写入 dataDock，非数据段收起写入 dock', () => {
    const dataParams = buildWorkspaceSearchParams({
      mapToolId: null,
      mapToolVariant: null,
      drawerToolId: null,
      panelToolIds: [],
      dataModuleId: 'thematic',
      dataModuleCollapsed: true,
      nonDataModuleRoute: null,
      nonDataModuleCollapsed: false,
    })
    expect(dataParams.get('dataDock')).toBe('collapsed')
    expect(dataParams.get('dock')).toBeNull()

    const opsParams = buildWorkspaceSearchParams({
      mapToolId: null,
      mapToolVariant: null,
      drawerToolId: null,
      panelToolIds: [],
      dataModuleId: null,
      dataModuleCollapsed: false,
      nonDataModuleRoute: { section: 'ops', moduleId: 'view-project' },
      nonDataModuleCollapsed: true,
    })
    expect(opsParams.get('dock')).toBe('collapsed')
    expect(opsParams.get('dataDock')).toBeNull()
  })

  it('侧栏模块全局互斥：pathname 只反映当前唯一模块', () => {
    const location = selectWorkspaceLocation({
      activeMapTool: null,
      activeDrawerTool: null,
      activePanelTools: [],
      activeDockModuleId: 'uav-list',
      dockPanelCollapsed: false,
      activeModuleId: null,
      modulePanelCollapsed: false,
    })
    expect(location.pathname).toBe('/uav/uav-list')
    expect(location.searchParams.get('data')).toBeNull()
  })

  it('业务模块仅写入 pathname，不写入 ?data= query', () => {
    const location = selectWorkspaceLocation({
      activeMapTool: null,
      activeDrawerTool: null,
      activePanelTools: [],
      activeDockModuleId: null,
      dockPanelCollapsed: false,
      activeModuleId: 'thematic',
      modulePanelCollapsed: false,
    })
    expect(location.pathname).toBe('/data/thematic')
    expect(location.searchParams.get('data')).toBeNull()
    expect(location.searchParams.toString()).toBe('')
  })

  it('遗留 ?data= 与非数据 pathname 并存时只保留 pathname 模块', () => {
    const parsed = parseWorkspaceUrl(new URLSearchParams('data=thematic'), '/uav/uav-list')
    expect(parsed.nonDataModuleRoute).toEqual({ section: 'uav', moduleId: 'uav-list' })
    expect(parsed.dataModuleId).toBeNull()

    const patch = resolveWorkspaceStorePatch(parsed)
    expect(patch.activeModuleId).toBeNull()
    expect(patch.activeDockModuleId).toBe('uav-list')
  })

  it('workspaceLocationsEqual 检测到遗留 ?data= 并触发 URL 清理', () => {
    const target = selectWorkspaceLocation({
      activeMapTool: null,
      activeDrawerTool: null,
      activePanelTools: [],
      activeDockModuleId: null,
      dockPanelCollapsed: false,
      activeModuleId: 'thematic',
      modulePanelCollapsed: false,
    })

    expect(
      workspaceLocationsEqual(
        {
          pathname: '/data/thematic',
          searchParams: new URLSearchParams('data=thematic'),
        },
        target,
      ),
    ).toBe(false)

    expect(
      workspaceLocationsEqual(
        {
          pathname: '/data/thematic',
          searchParams: new URLSearchParams(),
        },
        target,
      ),
    ).toBe(true)
  })

  it('legacy /?data= 可解析为单模块并等待同步到 /data/:moduleId', () => {
    const parsed = parseWorkspaceUrl(new URLSearchParams('data=thematic'), '/')
    expect(parsed.dataModuleId).toBe('thematic')
    expect(parsed.nonDataModuleRoute).toBeNull()
  })

  it('空状态不写入 query', () => {
    const params = buildWorkspaceSearchParams({
      mapToolId: null,
      mapToolVariant: null,
      drawerToolId: null,
      panelToolIds: [],
      dataModuleId: null,
      dataModuleCollapsed: false,
      nonDataModuleRoute: null,
      nonDataModuleCollapsed: false,
    })
    expect(params.toString()).toBe('')
  })

  it('resolveWorkspaceStorePatch 映射 navItemId 与 variant', () => {
    const patch = resolveWorkspaceStorePatch({
      mapToolId: 'measure-distance',
      mapToolVariant: 'drawLine',
      drawerToolId: null,
      panelToolIds: [],
      dataModuleId: null,
      dataModuleCollapsed: false,
      nonDataModuleRoute: { section: 'uav', moduleId: 'uav-collect' },
      nonDataModuleCollapsed: true,
    })
    expect(patch.activeMapTool).toMatchObject({
      navItemId: 'tool-draw-line',
      toolId: 'measure-distance',
      pluginToolId: 'measure-distance-plugin',
      variantKey: 'drawLine',
    })
    expect(patch.activeDrawerTool).toBeNull()
    expect(patch.activeModuleId).toBeNull()
    expect(patch.activeDockModuleNavId).toBe('dock-uav-collect')
    expect(patch.dockPanelCollapsed).toBe(true)
    expect(patch.activeModuleNavId).toBeNull()
  })

  it('resolveWorkspaceStorePatch 将 data 段写入 activeModuleId', () => {
    const patch = resolveWorkspaceStorePatch({
      mapToolId: null,
      mapToolVariant: null,
      drawerToolId: null,
      panelToolIds: [],
      dataModuleId: 'thematic',
      dataModuleCollapsed: false,
      nonDataModuleRoute: null,
      nonDataModuleCollapsed: false,
    })
    expect(patch.activeModuleNavId).toBe('module-thematic')
    expect(patch.activeModuleId).toBe('thematic')
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
      dataModuleId: null,
      dataModuleCollapsed: false,
      nonDataModuleRoute: null,
      nonDataModuleCollapsed: false,
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
