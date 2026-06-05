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
  ScanSearchIcon,
  SplineIcon,
  type LucideIcon,
} from 'lucide-react'

export interface QuickToolDef {
  navItemId: string
  label: string
  icon: LucideIcon
}

/** 可加入快捷工具条的地图工具目录 */
export const QUICK_TOOL_CATALOG: QuickToolDef[] = [
  { navItemId: 'tool-measure-distance', label: '测距', icon: RulerIcon },
  { navItemId: 'tool-measure-area', label: '测面', icon: LandPlotIcon },
  { navItemId: 'tool-plot-point', label: '绘点', icon: CircleDotIcon },
  { navItemId: 'tool-draw-line', label: '绘线', icon: SplineIcon },
  { navItemId: 'tool-draw-surface', label: '绘面', icon: LandPlotIcon },
  { navItemId: 'tool-pick-point', label: '拾取', icon: CrosshairIcon },
  { navItemId: 'tool-locate-point', label: '定位', icon: LocateFixedIcon },
  { navItemId: 'tool-global-search', label: '搜索', icon: ScanSearchIcon },
  { navItemId: 'tool-import-file', label: '导入', icon: FileUpIcon },
  { navItemId: 'tool-swipe-compare', label: '卷帘', icon: Columns2Icon },
  { navItemId: 'tool-hd-image-compare', label: '影像对比', icon: SatelliteIcon },
  { navItemId: 'tool-admin-divisions', label: '区划', icon: MapPinnedIcon },
  { navItemId: 'tool-panorama-point', label: '全景', icon: Rotate3dIcon },
]

export const DEFAULT_QUICK_TOOL_IDS = [
  'tool-measure-distance',
  'tool-measure-area',
  'tool-pick-point',
  'tool-global-search',
  'tool-import-file',
  'tool-swipe-compare',
] as const

export const MAX_QUICK_TOOLS = 8
export const MIN_QUICK_TOOLS = 1

const catalogIds = new Set(QUICK_TOOL_CATALOG.map((item) => item.navItemId))

export function isQuickToolCatalogId(navItemId: string): boolean {
  return catalogIds.has(navItemId)
}

export function resolveQuickToolDef(navItemId: string): QuickToolDef | undefined {
  return QUICK_TOOL_CATALOG.find((item) => item.navItemId === navItemId)
}

export function sanitizeQuickToolbarIds(ids: string[]): string[] {
  const unique: string[] = []
  for (const id of ids) {
    if (!isQuickToolCatalogId(id) || unique.includes(id)) continue
    unique.push(id)
    if (unique.length >= MAX_QUICK_TOOLS) break
  }
  return unique.length >= MIN_QUICK_TOOLS ? unique : [...DEFAULT_QUICK_TOOL_IDS]
}
