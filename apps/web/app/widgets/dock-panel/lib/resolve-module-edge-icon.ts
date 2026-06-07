import {
  BarChart3Icon,
  BookmarkIcon,
  BookmarkPlusIcon,
  ClipboardListIcon,
  EyeIcon,
  FolderKanbanIcon,
  LayoutGridIcon,
  ListTreeIcon,
  MountainIcon,
  RouteIcon,
  Share2Icon,
  SparklesIcon,
  VideoIcon,
  WarehouseIcon,
  type LucideIcon,
} from 'lucide-react'

const MODULE_EDGE_ICONS: Record<string, LucideIcon> = {
  'view-project': FolderKanbanIcon,
  'my-favorites': BookmarkIcon,
  thematic: LayoutGridIcon,
  'scenic-spots': MountainIcon,
  legend: ListTreeIcon,
  'property-view': EyeIcon,
  'flight-ledger': ClipboardListIcon,
  'flight-ai-alerts': SparklesIcon,
  'spatial-analysis': BarChart3Icon,
  'custom-highway-alert': RouteIcon,
  'custom-live-share': Share2Icon,
  'video-monitor': VideoIcon,
}

const DOCK_MODULE_EDGE_ICONS: Record<string, LucideIcon> = {
  'uav-list': WarehouseIcon,
  'uav-collect': BookmarkPlusIcon,
  'uav-settings': WarehouseIcon,
}

const MODULE_EDGE_SHORT_LABELS: Record<string, string> = {
  'my-favorites': '收藏',
  'view-project': '项目',
  thematic: '专题',
  'scenic-spots': '景点',
  legend: '图例',
  'property-view': '属性',
  'uav-list': '机库',
  'uav-collect': '收藏',
}

export function resolveModuleEdgeIcon(moduleId: string): LucideIcon | undefined {
  return MODULE_EDGE_ICONS[moduleId]
}

export function resolveDockModuleEdgeIcon(moduleId: string): LucideIcon | undefined {
  return DOCK_MODULE_EDGE_ICONS[moduleId]
}

export function resolveModuleEdgeShortLabel(moduleId: string, title: string): string {
  return MODULE_EDGE_SHORT_LABELS[moduleId] ?? title.slice(0, 2)
}
