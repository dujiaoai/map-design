import { describe, expect, it } from 'vitest'

import {
  clampSurfacePosition,
  EDGE_MARGIN,
  resolveDefaultAnchoredPosition,
  snapSurfacePosition,
  type SurfaceDragMetrics,
} from './surface-drag-math'

const metrics: SurfaceDragMetrics = {
  containerWidth: 800,
  containerHeight: 600,
  elementWidth: 200,
  elementHeight: 44,
}

describe('snapSurfacePosition', () => {
  it('吸附到左缘', () => {
    const result = snapSurfacePosition({ x: 20, y: 20 }, metrics)
    expect(result.snapX).toBe('left')
    expect(result.position.x).toBe(EDGE_MARGIN)
  })

  it('吸附到水平居中', () => {
    const centerX = (metrics.containerWidth - metrics.elementWidth) / 2
    const result = snapSurfacePosition({ x: centerX + 10, y: 20 }, metrics)
    expect(result.snapX).toBe('center')
    expect(result.position.x).toBe(centerX)
  })

  it('吸附到右缘', () => {
    const rightX = metrics.containerWidth - metrics.elementWidth - EDGE_MARGIN
    const result = snapSurfacePosition({ x: rightX - 5, y: 20 }, metrics)
    expect(result.snapX).toBe('right')
    expect(result.position.x).toBe(rightX)
  })

  it('超出阈值时不吸附', () => {
    const result = snapSurfacePosition({ x: 120, y: 120 }, metrics)
    expect(result.snapX).toBeNull()
    expect(result.snapY).toBeNull()
    expect(result.position).toEqual(clampSurfacePosition({ x: 120, y: 120 }, metrics))
  })
})

describe('resolveDefaultAnchoredPosition', () => {
  it('左侧面板默认锚点', () => {
    const container = { clientWidth: 800, clientHeight: 600 } as HTMLElement
    const element = { offsetWidth: 360, offsetHeight: 200 } as HTMLElement
    expect(resolveDefaultAnchoredPosition('left', container, element)).toEqual({
      x: 12,
      y: 56,
    })
  })
})
