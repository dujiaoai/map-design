import type { Modifier } from '@dnd-kit/core'

export const EDGE_MARGIN = 8
export const SNAP_THRESHOLD = 28
export const NEEDS_LAYOUT_CENTER = -1
export const NEEDS_LAYOUT_ANCHOR = -2

/** 工具面板默认锚点（top-14 / left-3） */
export const PANEL_ANCHOR_TOP = 56
export const PANEL_ANCHOR_INSET = 12

export type SurfaceSnapX = 'left' | 'center' | 'right'
export type SurfaceSnapY = 'top'

export interface SurfaceDragPosition {
  x: number
  y: number
}

export interface SurfaceDragMetrics {
  containerWidth: number
  containerHeight: number
  elementWidth: number
  elementHeight: number
}

export interface SurfaceSnapResult {
  position: SurfaceDragPosition
  snapX: SurfaceSnapX | null
  snapY: SurfaceSnapY | null
}

export function getSurfaceMetrics(
  container: HTMLElement,
  element: HTMLElement,
): SurfaceDragMetrics {
  return {
    containerWidth: container.clientWidth,
    containerHeight: container.clientHeight,
    elementWidth: element.offsetWidth,
    elementHeight: element.offsetHeight,
  }
}

function getSnapTargets(metrics: SurfaceDragMetrics) {
  const maxX = Math.max(EDGE_MARGIN, metrics.containerWidth - metrics.elementWidth - EDGE_MARGIN)
  const maxY = Math.max(EDGE_MARGIN, metrics.containerHeight - metrics.elementHeight - EDGE_MARGIN)

  return {
    x: [
      { id: 'left' as const, value: EDGE_MARGIN },
      { id: 'center' as const, value: (metrics.containerWidth - metrics.elementWidth) / 2 },
      { id: 'right' as const, value: maxX },
    ],
    y: [{ id: 'top' as const, value: EDGE_MARGIN }],
    bounds: {
      minX: EDGE_MARGIN,
      maxX,
      minY: EDGE_MARGIN,
      maxY,
    },
  }
}

export function resolveDefaultCenter(
  container: HTMLElement,
  element: HTMLElement,
): SurfaceDragPosition {
  const metrics = getSurfaceMetrics(container, element)
  const targets = getSnapTargets(metrics)
  return {
    x: targets.x.find((item) => item.id === 'center')?.value ?? EDGE_MARGIN,
    y: EDGE_MARGIN,
  }
}

export function resolveDefaultAnchoredPosition(
  placement: 'left' | 'right',
  container: HTMLElement,
  element: HTMLElement,
): SurfaceDragPosition {
  const metrics = getSurfaceMetrics(container, element)
  const x =
    placement === 'left'
      ? PANEL_ANCHOR_INSET
      : metrics.containerWidth - metrics.elementWidth - PANEL_ANCHOR_INSET

  return clampSurfacePosition({ x, y: PANEL_ANCHOR_TOP }, metrics)
}

export function clampSurfacePosition(
  position: SurfaceDragPosition,
  metrics: SurfaceDragMetrics,
): SurfaceDragPosition {
  const { bounds } = getSnapTargets(metrics)
  return {
    x: Math.min(Math.max(position.x, bounds.minX), bounds.maxX),
    y: Math.min(Math.max(position.y, bounds.minY), bounds.maxY),
  }
}

export function snapSurfacePosition(
  position: SurfaceDragPosition,
  metrics: SurfaceDragMetrics,
  threshold = SNAP_THRESHOLD,
): SurfaceSnapResult {
  const targets = getSnapTargets(metrics)
  const clamped = clampSurfacePosition(position, metrics)

  let snapX: SurfaceSnapX | null = null
  let snapY: SurfaceSnapY | null = null
  let x = clamped.x
  let y = clamped.y

  for (const target of targets.x) {
    if (Math.abs(x - target.value) <= threshold) {
      x = target.value
      snapX = target.id
      break
    }
  }

  for (const target of targets.y) {
    if (Math.abs(y - target.value) <= threshold) {
      y = target.value
      snapY = target.id
      break
    }
  }

  return {
    position: { x, y },
    snapX,
    snapY,
  }
}

export function createSurfaceSnapModifier(options: {
  dragId: string
  getBasePosition: () => SurfaceDragPosition
  getMetrics: () => SurfaceDragMetrics | null
}): Modifier {
  return ({ transform, active }) => {
    if (!active || String(active.id) !== options.dragId) {
      return transform
    }

    const metrics = options.getMetrics()
    if (!metrics) {
      return transform
    }

    const base = options.getBasePosition()
    const raw = {
      x: base.x + transform.x,
      y: base.y + transform.y,
    }
    const { position } = snapSurfacePosition(raw, metrics)

    return {
      ...transform,
      x: position.x - base.x,
      y: position.y - base.y,
    }
  }
}

export function createMovablePanelDragId(navItemId: string) {
  return `movable-panel:${navItemId}`
}

export const QUICK_TOOLBAR_DRAG_ID = 'quick-toolbar-position'
