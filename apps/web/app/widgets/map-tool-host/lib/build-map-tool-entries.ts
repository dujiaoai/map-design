import { mockNavMainItems, resolveNavToolMeta } from '~/entities/navigation'
import type { MapToolVariantKey } from '~/entities/navigation'
import type { ActiveMapTool } from '~/features/map-workspace'

export interface MapToolEntry {
  navItemId: string
  toolId: string
  title: string
  placement: 'left' | 'right'
  presentation: 'anchor' | 'movable-panel'
  variantKey?: MapToolVariantKey
  pluginToolId: string
}

const PRESENTATION_HOST = new Set(['anchor', 'movable-panel'])

interface ActivePanelToolRef {
  navItemId: string
  toolId: string
}

export function buildMapToolEntries(options: {
  activeMapTool: ActiveMapTool | null
  activePanelTools: ActivePanelToolRef[]
}): MapToolEntry[] {
  const entries: MapToolEntry[] = []

  if (options.activeMapTool) {
    const meta = resolveNavToolMeta(mockNavMainItems, options.activeMapTool.navItemId)
    if (meta && PRESENTATION_HOST.has(meta.presentation)) {
      entries.push({
        navItemId: options.activeMapTool.navItemId,
        toolId: options.activeMapTool.toolId,
        title: meta.title,
        placement: meta.placement,
        presentation: meta.presentation as 'anchor' | 'movable-panel',
        variantKey: meta.variantKey,
        pluginToolId: meta.pluginToolId,
      })
    }
  }

  for (const panel of options.activePanelTools) {
    const meta = resolveNavToolMeta(mockNavMainItems, panel.navItemId)
    if (meta && PRESENTATION_HOST.has(meta.presentation)) {
      entries.push({
        navItemId: panel.navItemId,
        toolId: panel.toolId,
        title: meta.title,
        placement: meta.placement,
        presentation: meta.presentation as 'anchor' | 'movable-panel',
        variantKey: meta.variantKey,
        pluginToolId: meta.pluginToolId,
      })
    }
  }

  return entries
}

export function partitionMapToolEntries(entries: MapToolEntry[]): {
  movable: MapToolEntry[]
  anchorByPlacement: { left: MapToolEntry[]; right: MapToolEntry[] }
} {
  const movable: MapToolEntry[] = []
  const anchorByPlacement = { left: [] as MapToolEntry[], right: [] as MapToolEntry[] }

  for (const entry of entries) {
    if (entry.presentation === 'movable-panel') {
      movable.push(entry)
      continue
    }
    if (entry.placement === 'left') {
      anchorByPlacement.left.push(entry)
    } else {
      anchorByPlacement.right.push(entry)
    }
  }

  return { movable, anchorByPlacement }
}

/** @deprecated 仅 anchor 面板使用列布局 */
export function groupMapToolEntriesByPlacement(
  entries: MapToolEntry[],
): { left: MapToolEntry[]; right: MapToolEntry[] } {
  const left: MapToolEntry[] = []
  const right: MapToolEntry[] = []

  for (const entry of entries) {
    if (entry.placement === 'left') {
      left.push(entry)
    } else {
      right.push(entry)
    }
  }

  return { left, right }
}

export function mapToolColumnWidth(placement: 'left' | 'right'): string {
  return placement === 'left' ? 'w-[360px]' : 'w-[320px]'
}

export function formatVariantLabel(variantKey?: string): string | null {
  if (variantKey === 'drawLine') return '绘线模式'
  if (variantKey === 'drawSurface') return '绘面模式'
  return null
}
