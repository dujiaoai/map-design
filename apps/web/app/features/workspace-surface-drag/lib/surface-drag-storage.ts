import type { SurfaceDragPosition } from './surface-drag-math'

const PANEL_POSITION_PREFIX = 'map-workspace-panel-position:'

export function loadPanelSurfacePosition(storageKey: string): SurfaceDragPosition | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = localStorage.getItem(`${PANEL_POSITION_PREFIX}${storageKey}`)
    if (!raw) {
      return null
    }

    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as SurfaceDragPosition).x === 'number' &&
      typeof (parsed as SurfaceDragPosition).y === 'number'
    ) {
      return parsed as SurfaceDragPosition
    }
  } catch {
    return null
  }

  return null
}

export function savePanelSurfacePosition(storageKey: string, position: SurfaceDragPosition): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(`${PANEL_POSITION_PREFIX}${storageKey}`, JSON.stringify(position))
}
