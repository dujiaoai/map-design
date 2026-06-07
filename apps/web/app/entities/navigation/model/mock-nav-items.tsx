import {
  BarChart3Icon,
  BookmarkIcon,
  BookmarkPlusIcon,
  BookOpenIcon,
  BriefcaseIcon,
  Building2Icon,
  CircleDotIcon,
  ClipboardListIcon,
  Columns2Icon,
  CrosshairIcon,
  EyeIcon,
  FileUpIcon,
  FolderKanbanIcon,
  HeadphonesIcon,
  LandPlotIcon,
  LayoutGridIcon,
  ListTreeIcon,
  LocateFixedIcon,
  MapPinnedIcon,
  MountainIcon,
  PentagonIcon,
  RouteIcon,
  RulerIcon,
  SatelliteIcon,
  ScanSearchIcon,
  Share2Icon,
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

/** 地图工具全集（方案 C：不在侧栏展示，入口为快捷工具条 + 命令面板） */
export const mockNavToolItems: NavMainItem[] = [
  // —— 量测与绘制（tool）——
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
  // —— 影像对比（tool / panel）——
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
  // —— 工具条带 / 检索（modify-panel / tool）——
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
  // —— 底图控件（map-chrome，快捷入口）——
  {
    id: 'tool-admin-divisions',
    title: '行政区划',
    icon: <MapPinnedIcon />,
    kind: 'map-tool',
    toolId: 'admin-divisions',
  },
]

/** 侧栏「图层」— parallel-panel / display（可见性，非 Modify 工作流） */
export const mockNavLayerItems: NavMainItem[] = [
  {
    id: 'module-thematic',
    title: '专题图层',
    icon: <LayoutGridIcon />,
    kind: 'map-module',
    moduleId: 'thematic',
  },
  {
    id: 'module-scenic-spots',
    title: '景点聚类',
    icon: <MountainIcon />,
    kind: 'map-module',
    moduleId: 'scenic-spots',
  },
  {
    id: 'module-legend',
    title: '图例',
    icon: <ListTreeIcon />,
    kind: 'map-module',
    moduleId: 'legend',
  },
]

/** 侧栏「分析」— modify-panel 互斥组 */
export const mockNavAnalysisItems: NavMainItem[] = [
  {
    id: 'module-spatial-analysis',
    title: '做分析',
    icon: <BarChart3Icon />,
    kind: 'map-module',
    moduleId: 'spatial-analysis',
  },
  {
    id: 'module-property-view',
    title: '属性查看',
    icon: <EyeIcon />,
    kind: 'map-module',
    moduleId: 'property-view',
  },
  {
    id: 'module-my-favorites',
    title: '我的收藏',
    icon: <BookmarkIcon />,
    kind: 'map-module',
    moduleId: 'my-favorites',
  },
]

/** @deprecated 使用 mockNavLayerItems + mockNavAnalysisItems */
export const mockNavDataItems: NavMainItem[] = [
  ...mockNavLayerItems,
  ...mockNavAnalysisItems,
]

/** 侧栏「机库」— uav-workspace */
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
    icon: <BookmarkPlusIcon />,
    kind: 'map-dock-module',
    moduleId: 'uav-collect',
  },
]

/** 侧栏「运营」— display / modify-panel */
export const mockNavOpsItems: NavMainItem[] = [
  {
    id: 'module-view-project',
    title: '看项目',
    icon: <FolderKanbanIcon />,
    kind: 'map-module',
    moduleId: 'view-project',
  },
  {
    id: 'module-flight-ledger',
    title: '飞行数据',
    icon: <ClipboardListIcon />,
    kind: 'map-module',
    moduleId: 'flight-ledger',
  },
  {
    id: 'module-flight-ai-alerts',
    title: '事件',
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
    title: '地图分享',
    icon: <Share2Icon />,
    kind: 'map-module',
    moduleId: 'custom-live-share',
  },
  {
    id: 'module-video-monitor',
    title: '视频监控',
    icon: <VideoIcon />,
    kind: 'map-module',
    moduleId: 'video-monitor',
  },
]

/** 侧栏「应用」— 路由 / 外链 */
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

/** @deprecated 由 mockNavMapSectionDefs 各段合并 */
export const mockNavWorkspaceItems: NavMainItem[] = [
  ...mockNavLayerItems,
  ...mockNavAnalysisItems,
  ...mockNavUavItems,
  ...mockNavOpsItems,
  ...mockNavAppItems,
]

/** 侧栏可见分段（用户心智：看图层 → 做分析 → 运营 → 机库 → 应用） */
export const mockNavMapSectionDefs: NavMapSectionDef[] = [
  { id: 'layers', label: '图层', items: mockNavLayerItems },
  { id: 'analysis', label: '分析', items: mockNavAnalysisItems },
  {
    id: 'ops',
    label: '运营',
    items: mockNavOpsItems,
    collapsible: true,
    defaultOpen: true,
    storageKey: 'nav-section-ops',
  },
  {
    id: 'uav',
    label: '机库',
    items: mockNavUavItems,
    collapsible: true,
    defaultOpen: true,
    storageKey: 'nav-section-uav',
  },
  {
    id: 'app',
    label: '应用',
    items: mockNavAppItems,
    collapsible: true,
    defaultOpen: false,
    storageKey: 'nav-section-app',
  },
]

/** 全量菜单（URL 解析、快捷条、handleNavSelect；含侧栏不可见的 map-tool） */
export const mockNavMainItems: NavMainItem[] = [
  ...mockNavToolItems,
  ...mockNavLayerItems,
  ...mockNavAnalysisItems,
  ...mockNavOpsItems,
  ...mockNavUavItems,
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
  'tool-global-search': { toolId: 'global-search', ...mockToolMeta['global-search'] },
}

export const mockDockModuleMeta: Record<string, MockDockModuleMeta> = {
  'uav-list': { title: '机库列表' },
  'uav-collect': { title: '机库收藏' },
  'uav-settings': { title: '机库设置' },
}

export const mockModuleMeta: Record<string, MockModuleMeta> = {
  thematic: {
    title: '专题图层',
    segment: 'layers',
    pluginToolId: 'special-topic-layer-plugin',
    pluginType: 'parallel-panel',
  },
  'scenic-spots': {
    title: '景点聚类',
    segment: 'layers',
    pluginToolId: 'scenic-spots-plugin',
    pluginType: 'display',
  },
  legend: {
    title: '图例',
    segment: 'layers',
    pluginToolId: 'legend-plugin',
    pluginType: 'display',
  },
  'spatial-analysis': {
    title: '做分析',
    segment: 'analysis',
    pluginToolId: 'do-analysis-plugin',
    pluginType: 'modify-panel',
  },
  'property-view': {
    title: '属性查看',
    segment: 'analysis',
    pluginToolId: 'property-view-plugin',
    pluginType: 'modify-panel',
  },
  'my-favorites': {
    title: '我的收藏',
    segment: 'analysis',
    pluginToolId: 'favorites-plugin',
    pluginType: 'modify-panel',
  },
  'view-project': {
    title: '看项目',
    segment: 'ops',
    pluginToolId: 'view-project-plugin',
    pluginType: 'modify-panel',
  },
  'flight-ledger': {
    title: '飞行数据',
    segment: 'ops',
    pluginToolId: 'flight-data-plugin',
    pluginType: 'display',
  },
  'flight-ai-alerts': {
    title: '事件',
    segment: 'ops',
    pluginToolId: 'events-plugin',
    pluginType: 'display',
  },
  'custom-highway-alert': {
    title: '高速预警',
    segment: 'ops',
    pluginToolId: 'high-speed-warning-plugin',
    pluginType: 'display',
    tenantFeature: 'custom.highway-alert',
  },
  'custom-live-share': {
    title: '地图分享',
    segment: 'ops',
    pluginToolId: 'share-list-plugin',
    pluginType: 'display',
    tenantFeature: 'custom.live-share',
  },
  'video-monitor': {
    title: '视频监控',
    segment: 'ops',
    pluginToolId: 'video-monitor',
    pluginType: 'display',
  },
}
