/** SaaS 快捷工具 toolId → packages-map pluginToolId 登记（Phase C 接入时按此表分发） */
export const MAP_PLUGIN_TOOL_REGISTRY = {
  'measure-distance-plugin': {
    label: '测距 / 绘线',
    variants: ['drawLine'] as const,
  },
  'measure-area-plugin': {
    label: '测面 / 绘面',
    variants: ['drawSurface'] as const,
  },
  'interest-point-plugin': {
    label: '绘点',
    variants: [] as const,
  },
  'pick-map-point-plugin': {
    label: '点坐标拾取',
    variants: [] as const,
  },
  'locate-map-point-plugin': {
    label: '点坐标定位',
    variants: [] as const,
  },
  'import-file-plugin': {
    label: '导入',
    variants: [] as const,
  },
  'comparison-plugin': { label: '卷帘对比', variants: [] as const },
  'ortho-imagery-comparison-plugin': { label: '高清影像对比', variants: [] as const },
  'region-navigator-plugin': { label: '行政区划', variants: [] as const },
  'map-search-plugin': { label: '搜索', variants: [] as const },
} as const

/** 侧栏 map-module → packages-map pluginToolId 登记 */
export const MAP_PLUGIN_MODULE_REGISTRY = {
  'special-topic-layer-plugin': { label: '专题图层', moduleId: 'thematic' },
  'scenic-spots-plugin': { label: '景点聚类', moduleId: 'scenic-spots' },
  'legend-plugin': { label: '图例', moduleId: 'legend' },
  'do-analysis-plugin': { label: '做分析', moduleId: 'spatial-analysis' },
  'property-view-plugin': { label: '属性查看', moduleId: 'property-view' },
  'favorites-plugin': { label: '我的收藏', moduleId: 'my-favorites' },
  'view-project-plugin': { label: '看项目', moduleId: 'view-project' },
  'flight-data-plugin': { label: '飞行数据', moduleId: 'flight-ledger' },
  'events-plugin': { label: '事件', moduleId: 'flight-ai-alerts' },
  'high-speed-warning-plugin': { label: '高速预警', moduleId: 'custom-highway-alert' },
  'share-list-plugin': { label: '地图分享', moduleId: 'custom-live-share' },
  'video-monitor': { label: '视频监控', moduleId: 'video-monitor' },
} as const

export type MapPluginToolId = keyof typeof MAP_PLUGIN_TOOL_REGISTRY
export type MapPluginModuleToolId = keyof typeof MAP_PLUGIN_MODULE_REGISTRY

export function isKnownPluginToolId(id: string): id is MapPluginToolId {
  return id in MAP_PLUGIN_TOOL_REGISTRY
}

export function isKnownPluginModuleToolId(id: string): id is MapPluginModuleToolId {
  return id in MAP_PLUGIN_MODULE_REGISTRY
}

export function isKnownPluginToolIdInRegistry(id: string): boolean {
  return isKnownPluginToolId(id) || isKnownPluginModuleToolId(id)
}
