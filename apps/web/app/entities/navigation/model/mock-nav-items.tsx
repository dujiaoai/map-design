import {
  BarChart3Icon,
  BookmarkIcon,
  BookOpenIcon,
  BriefcaseIcon,
  Building2Icon,
  CircleDotIcon,
  ClapperboardIcon,
  ClipboardListIcon,
  Columns2Icon,
  CrosshairIcon,
  FileUpIcon,
  FolderKanbanIcon,
  Globe2Icon,
  HeadphonesIcon,
  HeartIcon,
  LandPlotIcon,
  LayoutGridIcon,
  LocateFixedIcon,
  MapPinnedIcon,
  PentagonIcon,
  Rotate3dIcon,
  RouteIcon,
  RulerIcon,
  SatelliteIcon,
  ScanSearchIcon,
  SparklesIcon,
  SplineIcon,
  VideoIcon,
  WarehouseIcon,
  WrenchIcon,
} from 'lucide-react'

import type {
  MockDockModuleMeta,
  MockModuleMeta,
  MockToolMeta,
  NavMainItem,
  NavMapSectionDef,
} from './types'

/** 侧栏「工具」（仅一级菜单，原分组子项已平铺） */
export const mockNavToolItems: NavMainItem[] = [
  {
    id: 'tool-measure-distance',
    title: '测距',
    icon: <RulerIcon />,
    kind: 'map-tool',
    toolId: 'measure-distance',
  },
  {
    id: 'tool-measure-area',
    title: '测面',
    icon: <LandPlotIcon />,
    kind: 'map-tool',
    toolId: 'measure-area',
  },
  {
    id: 'tool-plot-point',
    title: '绘点',
    icon: <CircleDotIcon />,
    kind: 'map-tool',
    toolId: 'plot-point',
  },
  {
    id: 'tool-draw-line',
    title: '绘线',
    icon: <SplineIcon />,
    kind: 'map-tool',
    toolId: 'measure-distance',
  },
  {
    id: 'tool-draw-surface',
    title: '绘面',
    icon: <PentagonIcon />,
    kind: 'map-tool',
    toolId: 'measure-area',
  },
  {
    id: 'tool-pick-point',
    title: '点坐标拾取',
    icon: <CrosshairIcon />,
    kind: 'map-tool',
    toolId: 'pick-point',
  },
  {
    id: 'tool-locate-point',
    title: '点坐标定位',
    icon: <LocateFixedIcon />,
    kind: 'map-tool',
    toolId: 'locate-point',
  },
  {
    id: 'tool-swipe-compare',
    title: '卷帘对比',
    icon: <Columns2Icon />,
    kind: 'map-tool',
    toolId: 'swipe-compare',
  },
  {
    id: 'tool-hd-image-compare',
    title: '高清影像对比',
    icon: <SatelliteIcon />,
    kind: 'map-tool',
    toolId: 'hd-image-compare',
  },
  {
    id: 'tool-admin-divisions',
    title: '行政区划',
    icon: <MapPinnedIcon />,
    kind: 'map-tool',
    toolId: 'admin-divisions',
  },
  {
    id: 'tool-import-file',
    title: '导入',
    icon: <FileUpIcon />,
    kind: 'map-tool',
    toolId: 'import-file',
  },
  {
    id: 'tool-global-search',
    title: '搜索',
    icon: <ScanSearchIcon />,
    kind: 'map-tool',
    toolId: 'global-search',
  },
  {
    id: 'module-thematic',
    title: '专题',
    icon: <LayoutGridIcon />,
    kind: 'map-module',
    moduleId: 'thematic',
  },
  {
    id: 'module-spatial-analysis',
    title: '做分析',
    icon: <BarChart3Icon />,
    kind: 'map-module',
    moduleId: 'spatial-analysis',
  },
]

/** 侧栏「机库」 */
export const mockNavUavItems: NavMainItem[] = [
  {
    id: 'dock-uav-list',
    title: '机库列表',
    icon: <WarehouseIcon />,
    kind: 'map-dock-module',
    moduleId: 'uav-list',
  },
  {
    id: 'dock-uav-settings',
    title: '机库设置',
    icon: <WrenchIcon />,
    kind: 'map-dock-module',
    moduleId: 'uav-settings',
  },
  {
    id: 'dock-uav-collect',
    title: '机库收藏',
    icon: <BookmarkIcon />,
    kind: 'map-dock-module',
    moduleId: 'uav-collect',
  },
]

/** 侧栏「运营」 */
export const mockNavOpsItems: NavMainItem[] = [
  {
    id: 'module-view-project',
    title: '看项目',
    icon: <FolderKanbanIcon />,
    kind: 'map-module',
    moduleId: 'view-project',
  },
  {
    id: 'module-my-favorites',
    title: '我的收藏',
    icon: <HeartIcon />,
    kind: 'map-module',
    moduleId: 'my-favorites',
  },
  {
    id: 'module-flight-ledger',
    title: '飞行台账',
    icon: <ClipboardListIcon />,
    kind: 'map-module',
    moduleId: 'flight-ledger',
  },
  {
    id: 'module-flight-ai-alerts',
    title: 'AI事件警告',
    icon: <SparklesIcon />,
    kind: 'map-module',
    moduleId: 'flight-ai-alerts',
  },
  {
    id: 'module-custom-highway-alert',
    title: '高速预警',
    icon: <RouteIcon />,
    kind: 'map-module',
    moduleId: 'custom-highway-alert',
  },
  {
    id: 'module-custom-live-share',
    title: '直播分享',
    icon: <VideoIcon />,
    kind: 'map-module',
    moduleId: 'custom-live-share',
  },
]

/** 侧栏「全景」：地图工具 + 业务模块 */
export const mockNavPanoramaItems: NavMainItem[] = [
  {
    id: 'tool-panorama-point',
    title: '全景点位',
    icon: <Rotate3dIcon />,
    kind: 'map-tool',
    toolId: 'panorama-point',
  },
  {
    id: 'module-panorama-produce',
    title: '全景制作',
    icon: <ClapperboardIcon />,
    kind: 'map-module',
    moduleId: 'panorama-produce',
  },
  {
    id: 'module-panorama-viewer',
    title: '全景多观',
    icon: <Globe2Icon />,
    kind: 'map-module',
    moduleId: 'panorama-viewer',
  },
]

/** 侧栏「应用」 */
export const mockNavAppItems: NavMainItem[] = [
  {
    id: 'route-projects',
    title: '项目管理',
    icon: <BriefcaseIcon />,
    kind: 'route',
    url: '/projects',
  },
  {
    id: 'route-settings',
    title: '组织设置',
    icon: <Building2Icon />,
    kind: 'route',
    url: '/settings',
  },
  {
    id: 'ext-docs',
    title: '产品文档',
    icon: <BookOpenIcon />,
    kind: 'external',
    href: 'https://example.com/docs',
  },
  {
    id: 'ext-support',
    title: '技术支持',
    icon: <HeadphonesIcon />,
    kind: 'external',
    href: 'https://example.com/support',
  },
]

/** @deprecated 由 mockNavMapSectionDefs 各段合并；兼容旧引用 */
export const mockNavWorkspaceItems: NavMainItem[] = [
  ...mockNavUavItems,
  ...mockNavOpsItems,
  ...mockNavPanoramaItems,
  ...mockNavAppItems,
]

/** 侧栏五段定义（标签 + 原始菜单） */
export const mockNavMapSectionDefs: NavMapSectionDef[] = [
  { id: 'tools', label: '工具', items: mockNavToolItems, collapsible: true, defaultOpen: true },
  { id: 'uav', label: '机库', items: mockNavUavItems },
  { id: 'ops', label: '运营', items: mockNavOpsItems },
  { id: 'panorama', label: '全景', items: mockNavPanoramaItems },
  { id: 'app', label: '应用', items: mockNavAppItems },
]

/** 全量菜单（查找子项、URL 解析等） */
export const mockNavMainItems: NavMainItem[] = [
  ...mockNavToolItems,
  ...mockNavUavItems,
  ...mockNavOpsItems,
  ...mockNavPanoramaItems,
  ...mockNavAppItems,
]

/** 开发环境默认开通的租户定制能力 */
export const DEFAULT_TENANT_FEATURES = [
  'custom.highway-alert',
  'custom.live-share',
] as const

export function getModuleTenantFeature(moduleId: string): string | undefined {
  return mockModuleMeta[moduleId]?.tenantFeature
}

export const mockToolMeta: Record<string, MockToolMeta> = {
  'measure-distance': {
    title: '测距',
    placement: 'left',
    category: 'mode',
    presentation: 'movable-panel',
    pluginToolId: 'measure-distance-plugin',
    coordinatorGroup: 'mapInteraction',
  },
  'measure-area': {
    title: '测面',
    placement: 'left',
    category: 'mode',
    presentation: 'movable-panel',
    pluginToolId: 'measure-area-plugin',
    coordinatorGroup: 'mapInteraction',
  },
  'plot-point': {
    title: '绘点',
    placement: 'left',
    category: 'mode',
    presentation: 'movable-panel',
    pluginToolId: 'interest-point-plugin',
    coordinatorGroup: 'mapInteraction',
  },
  'pick-point': {
    title: '点坐标拾取',
    placement: 'right',
    category: 'mode',
    presentation: 'movable-panel',
    pluginToolId: 'pick-map-point-plugin',
    coordinatorGroup: 'mapInteraction',
  },
  'locate-point': {
    title: '点坐标定位',
    placement: 'right',
    category: 'mode',
    presentation: 'movable-panel',
    pluginToolId: 'locate-map-point-plugin',
    coordinatorGroup: 'mapInteraction',
  },
  'import-file': {
    title: '导入',
    placement: 'right',
    category: 'mode',
    presentation: 'drawer',
    pluginToolId: 'import-file-plugin',
    coordinatorGroup: 'drawer',
  },
  'swipe-compare': {
    title: '卷帘对比',
    placement: 'left',
    category: 'panel',
    presentation: 'movable-panel',
    pluginToolId: 'comparison-plugin',
    coordinatorGroup: 'mapInteraction',
  },
  'hd-image-compare': {
    title: '高清影像对比',
    placement: 'left',
    category: 'panel',
    presentation: 'movable-panel',
    pluginToolId: 'ortho-imagery-comparison-plugin',
    coordinatorGroup: 'mapInteraction',
  },
  'admin-divisions': {
    title: '行政区划',
    placement: 'left',
    category: 'mode',
    presentation: 'anchor',
    pluginToolId: 'region-navigator-plugin',
    coordinatorGroup: 'mapInteraction',
  },
  'panorama-point': {
    title: '全景点位',
    placement: 'left',
    category: 'mode',
    presentation: 'movable-panel',
    pluginToolId: 'panorama-multiple-plugin',
    coordinatorGroup: 'mapInteraction',
  },
  'global-search': {
    title: '搜索',
    placement: 'right',
    category: 'mode',
    presentation: 'drawer',
    pluginToolId: 'map-search-plugin',
    coordinatorGroup: 'drawer',
  },
}

export const mockNavToolMetaByItemId: Record<string, MockToolMeta & { toolId: string }> = {
  'tool-measure-distance': { toolId: 'measure-distance', ...mockToolMeta['measure-distance'] },
  'tool-measure-area': { toolId: 'measure-area', ...mockToolMeta['measure-area'] },
  'tool-plot-point': { toolId: 'plot-point', ...mockToolMeta['plot-point'] },
  'tool-draw-line': {
    toolId: 'measure-distance',
    title: '绘线',
    placement: 'left',
    category: 'mode',
    presentation: 'movable-panel',
    pluginToolId: 'measure-distance-plugin',
    coordinatorGroup: 'mapInteraction',
    variant: { drawLine: true },
    variantKey: 'drawLine',
  },
  'tool-draw-surface': {
    toolId: 'measure-area',
    title: '绘面',
    placement: 'left',
    category: 'mode',
    presentation: 'movable-panel',
    pluginToolId: 'measure-area-plugin',
    coordinatorGroup: 'mapInteraction',
    variant: { drawSurface: true },
    variantKey: 'drawSurface',
  },
  'tool-pick-point': { toolId: 'pick-point', ...mockToolMeta['pick-point'] },
  'tool-locate-point': { toolId: 'locate-point', ...mockToolMeta['locate-point'] },
  'tool-import-file': { toolId: 'import-file', ...mockToolMeta['import-file'] },
  'tool-swipe-compare': { toolId: 'swipe-compare', ...mockToolMeta['swipe-compare'] },
  'tool-hd-image-compare': { toolId: 'hd-image-compare', ...mockToolMeta['hd-image-compare'] },
  'tool-admin-divisions': { toolId: 'admin-divisions', ...mockToolMeta['admin-divisions'] },
  'tool-panorama-point': { toolId: 'panorama-point', ...mockToolMeta['panorama-point'] },
  'tool-global-search': { toolId: 'global-search', ...mockToolMeta['global-search'] },
}

export const mockDockModuleMeta: Record<string, MockDockModuleMeta> = {
  'uav-list': { title: '机库列表' },
  'uav-collect': { title: '机库收藏' },
  'uav-settings': { title: '机库设置' },
}

export const mockModuleMeta: Record<string, MockModuleMeta> = {
  'view-project': { title: '看项目', segment: 'ops' },
  'my-favorites': { title: '我的收藏', segment: 'ops' },
  thematic: { title: '专题', segment: 'layer' },
  'flight-ledger': { title: '飞行台账', segment: 'ops' },
  'flight-ai-alerts': { title: 'AI事件警告', segment: 'ops' },
  'spatial-analysis': { title: '做分析', segment: 'analysis' },
  'panorama-produce': { title: '全景制作', segment: 'panorama' },
  'panorama-viewer': { title: '全景多观', segment: 'panorama' },
  'custom-highway-alert': {
    title: '高速预警',
    segment: 'ops',
    tenantFeature: 'custom.highway-alert',
  },
  'custom-live-share': {
    title: '直播分享',
    segment: 'ops',
    tenantFeature: 'custom.live-share',
  },
}
