import {
  BriefcaseIcon,
  LayersIcon,
  MapPinIcon,
  RulerIcon,
  ScanSearchIcon,
  Settings2Icon,
  SparklesIcon,
  WarehouseIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@repo/ui'

import type { WorkspaceCommandGroup } from '~/features/workspace-command'

const groupIconMap: Record<WorkspaceCommandGroup, LucideIcon> = {
  recent: SparklesIcon,
  tool: RulerIcon,
  module: LayersIcon,
  dock: WarehouseIcon,
  navigation: BriefcaseIcon,
  search: MapPinIcon,
  system: Settings2Icon,
}

export function WorkspaceCommandGroupIcon({
  group,
  className,
}: {
  group: WorkspaceCommandGroup
  className?: string
}) {
  const Icon = groupIconMap[group] ?? ScanSearchIcon
  return <Icon className={cn('size-3.5 shrink-0 opacity-75', className)} aria-hidden />
}
