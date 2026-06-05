import { describe, expect, it } from 'vitest'

import { clampPanelOffset } from './clamp-panel-offset'

describe('clampPanelOffset', () => {
  it('keeps panel inside container', () => {
    const result = clampPanelOffset({
      offset: { x: 999, y: 999 },
      containerWidth: 800,
      containerHeight: 600,
      panelWidth: 360,
      panelHeight: 200,
      anchorInset: 12,
      anchorTop: 56,
      anchorSide: 'left',
    })
    expect(result.x).toBe(420)
    expect(result.y).toBe(336)
  })

  it('does not move above anchor origin', () => {
    const result = clampPanelOffset({
      offset: { x: -100, y: -100 },
      containerWidth: 800,
      containerHeight: 600,
      panelWidth: 360,
      panelHeight: 200,
      anchorInset: 12,
      anchorTop: 56,
      anchorSide: 'left',
    })
    expect(result.x).toBe(-4)
    expect(result.y).toBe(-48)
  })

  it('allows full horizontal travel for right-anchored panels', () => {
    const result = clampPanelOffset({
      offset: { x: 999, y: 0 },
      containerWidth: 800,
      containerHeight: 600,
      panelWidth: 320,
      panelHeight: 200,
      anchorInset: 12,
      anchorTop: 56,
      anchorSide: 'right',
    })
    expect(result.x).toBe(460)
  })

  it('does not cap right-anchored panels at anchor inset', () => {
    const result = clampPanelOffset({
      offset: { x: 120, y: 0 },
      containerWidth: 800,
      containerHeight: 600,
      panelWidth: 320,
      panelHeight: 200,
      anchorInset: 12,
      anchorTop: 56,
      anchorSide: 'right',
    })
    expect(result.x).toBe(120)
  })
})
