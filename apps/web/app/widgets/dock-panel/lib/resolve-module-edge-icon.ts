import {
  BarChart3Icon,
  BookmarkIcon,
  BookmarkPlusIcon,
  ClapperboardIcon,
  ClipboardListIcon,
  FolderKanbanIcon,
  Globe2Icon,
  LayoutGridIcon,
  RouteIcon,
  VideoIcon,
  WarehouseIcon,
  type LucideIcon,
} from 'lucide-react'

const MODULE_EDGE_ICONS: Record<string, LucideIcon> = {
  'view-project': FolderKanbanIcon,
  'my-favorites': BookmarkIcon,
  thematic: LayoutGridIcon,
  'flight-ledger': ClipboardListIcon,
  'flight-ai-alerts': BarChart3Icon,
  'spatial-analysis': BarChart3Icon,
  'panorama-produce': ClapperboardIcon,
  'panorama-viewer': Globe2Icon,
  'custom-highway-alert': RouteIcon,
  'custom-live-share': VideoIcon,
}

const DOCK_MODULE_EDGE_ICONS: Record<string, LucideIcon> = {
  'uav-list': WarehouseIcon,
  'uav-collect': BookmarkPlusIcon,
  'uav-settings': WarehouseIcon,
}

const MODULE_EDGE_SHORT_LABELS: Record<string, string> = {
  'my-favorites': '收藏',
  'view-project': '项目',
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
