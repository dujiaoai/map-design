import type { LucideIcon } from 'lucide-react'
import {
  BarChart3Icon,
  BriefcaseIcon,
  FolderKanbanIcon,
  LayoutGridIcon,
  LayoutListIcon,
  WarehouseIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import * as LucideIcons from 'lucide-react'

import type { AdminMenuSection } from './menus-admin-api'

/** 与 WorkspaceMenuCatalog 段 id 对齐的默认图标 */
const SECTION_ICON_FALLBACK: Record<string, LucideIcon> = {
  layers: LayoutGridIcon,
  analysis: BarChart3Icon,
  ops: FolderKanbanIcon,
  uav: WarehouseIcon,
  app: BriefcaseIcon,
}

export function resolveMenuLucideIcon(iconKey: string | null | undefined, className = 'size-4 shrink-0'): ReactNode {
  if (!iconKey?.trim()) return null

  const componentName = iconKey.endsWith('Icon') ? iconKey : `${iconKey}Icon`
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[componentName]
  if (!Icon) return null

  return <Icon className={className} aria-hidden />
}

export function resolveMenuSectionIcon(section: AdminMenuSection): ReactNode {
  const firstItemIcon = [...section.items]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((item) => item.icon)
    .find(Boolean)

  const resolved = resolveMenuLucideIcon(firstItemIcon)
  if (resolved) return resolved

  const Fallback = SECTION_ICON_FALLBACK[section.id] ?? LayoutListIcon
  return <Fallback className="size-4 shrink-0" aria-hidden />
}
