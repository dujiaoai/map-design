import {
  clampSurfacePosition,
  getSurfaceMetrics,
  NEEDS_LAYOUT_ANCHOR,
  type SurfaceDragPosition,
} from '~/features/workspace-surface-drag'

export const MAP_CONTROLS_LEGEND_WING_DRAG_ID = 'map-controls-legend-wing'
export const MAP_CONTROLS_LEGEND_WING_STORAGE_KEY = 'map-controls-legend-wing'

export const DEFAULT_MAP_CONTROLS_LEGEND_WING_POSITION: SurfaceDragPosition = {
  x: NEEDS_LAYOUT_ANCHOR,
  y: NEEDS_LAYOUT_ANCHOR,
}

export function needsMapControlsLegendWingLayout(position: SurfaceDragPosition) {
  return position.x === NEEDS_LAYOUT_ANCHOR && position.y === NEEDS_LAYOUT_ANCHOR
}

/** 默认锚在右下角 HUD 上方（与图例按钮对齐） */
export function resolveDefaultMapControlsLegendWingPosition(
  container: HTMLElement,
  element: HTMLElement,
): SurfaceDragPosition {
  const anchor = container.querySelector('.map-controls')
  if (!anchor) {
    const metrics = getSurfaceMetrics(container, element)
    return clampSurfacePosition(
      {
        x: metrics.containerWidth - metrics.elementWidth - 8,
        y: metrics.containerHeight - metrics.elementHeight - 48,
      },
      metrics,
    )
  }

  const containerRect = container.getBoundingClientRect()
  const anchorRect = anchor.getBoundingClientRect()
  const gap = 6
  const raw = {
    x: anchorRect.right - containerRect.left - element.offsetWidth,
    y: anchorRect.top - containerRect.top - element.offsetHeight - gap,
  }

  return clampSurfacePosition(raw, getSurfaceMetrics(container, element))
}
