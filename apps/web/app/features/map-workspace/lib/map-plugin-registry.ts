/** SaaS 菜单 toolId → packages-map pluginToolId 登记（Phase C 接入时按此表分发） */
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
  'panorama-multiple-plugin': { label: '全景点位', variants: [] as const },
  'map-search-plugin': { label: '搜索', variants: [] as const },
} as const

export type MapPluginToolId = keyof typeof MAP_PLUGIN_TOOL_REGISTRY

export function isKnownPluginToolId(id: string): id is MapPluginToolId {
  return id in MAP_PLUGIN_TOOL_REGISTRY
}
