import {
  CircleDotIcon,
  Columns2Icon,
  CrosshairIcon,
  FileUpIcon,
  LandPlotIcon,
  LocateFixedIcon,
  MapPinnedIcon,
  Rotate3dIcon,
  RulerIcon,
  SatelliteIcon,
  SplineIcon,
  type LucideIcon,
} from 'lucide-react'

export interface QuickToolDef {
  navItemId: string
  label: string
  icon: LucideIcon
  group: QuickToolGroup
}

export type QuickToolGroup = 'measure' | 'draw' | 'data' | 'analysis'

export const QUICK_TOOL_GROUP_ORDER: QuickToolGroup[] = ['measure', 'draw', 'data', 'analysis']

export const QUICK_TOOL_GROUP_LABELS: Record<QuickToolGroup, string> = {
  measure: '测量',
  draw: '绘制',
  data: '数据',
  analysis: '分析',
}

/** 可加入快捷工具条的地图工具目录 */
export const QUICK_TOOL_CATALOG: QuickToolDef[] = [
  { navItemId: 'tool-measure-distance', label: '测距', icon: RulerIcon, group: 'measure' },
  { navItemId: 'tool-measure-area', label: '测面', icon: LandPlotIcon, group: 'measure' },
  { navItemId: 'tool-plot-point', label: '绘点', icon: CircleDotIcon, group: 'draw' },
  { navItemId: 'tool-draw-line', label: '绘线', icon: SplineIcon, group: 'draw' },
  { navItemId: 'tool-draw-surface', label: '绘面', icon: LandPlotIcon, group: 'draw' },
  { navItemId: 'tool-pick-point', label: '拾取', icon: CrosshairIcon, group: 'draw' },
  { navItemId: 'tool-locate-point', label: '定位', icon: LocateFixedIcon, group: 'draw' },
  { navItemId: 'tool-import-file', label: '导入', icon: FileUpIcon, group: 'data' },
  { navItemId: 'tool-admin-divisions', label: '区划', icon: MapPinnedIcon, group: 'data' },
  { navItemId: 'tool-panorama-point', label: '全景', icon: Rotate3dIcon, group: 'data' },
  { navItemId: 'tool-swipe-compare', label: '卷帘', icon: Columns2Icon, group: 'analysis' },
  { navItemId: 'tool-hd-image-compare', label: '影像对比', icon: SatelliteIcon, group: 'analysis' },
]

export const DEFAULT_QUICK_TOOL_IDS = [
  'tool-measure-distance',
  'tool-measure-area',
  'tool-pick-point',
  'tool-import-file',
  'tool-swipe-compare',
] as const

export const MIN_QUICK_TOOLS = 1

const catalogIds = new Set(QUICK_TOOL_CATALOG.map((item) => item.navItemId))

export function isQuickToolCatalogId(navItemId: string): boolean {
  return catalogIds.has(navItemId)
}

export function resolveQuickToolDef(navItemId: string): QuickToolDef | undefined {
  return QUICK_TOOL_CATALOG.find((item) => item.navItemId === navItemId)
}

export function groupQuickToolCatalog(catalog: QuickToolDef[]): Array<{
  group: QuickToolGroup
  label: string
  items: QuickToolDef[]
}> {
  return QUICK_TOOL_GROUP_ORDER.map((group) => ({
    group,
    label: QUICK_TOOL_GROUP_LABELS[group],
    items: catalog.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0)
}

export function sanitizeQuickToolbarIds(ids: string[]): string[] {
  const unique: string[] = []
  for (const id of ids) {
    if (!isQuickToolCatalogId(id) || unique.includes(id)) continue
    unique.push(id)
  }
  return unique.length >= MIN_QUICK_TOOLS ? unique : [...DEFAULT_QUICK_TOOL_IDS]
}
