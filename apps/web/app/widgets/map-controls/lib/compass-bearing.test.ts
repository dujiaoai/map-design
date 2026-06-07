import { describe, expect, it } from 'vitest'

import {
  isNorthBearing,
  normalizeBearing,
  resolveBearingFromDrag,
  resolveCompassAzimuthLabel,
  snapCompassBearing,
} from './compass-bearing'

describe('compass-bearing', () => {
  it('normalizeBearing wraps into [0, 360)', () => {
    expect(normalizeBearing(-15)).toBe(345)
    expect(normalizeBearing(390)).toBe(30)
  })

  it('isNorthBearing detects north', () => {
    expect(isNorthBearing(0)).toBe(true)
    expect(isNorthBearing(359.6)).toBe(true)
    expect(isNorthBearing(12)).toBe(false)
  })

  it('resolveBearingFromDrag handles wrap-around', () => {
    expect(resolveBearingFromDrag(350, 10, 10)).toBe(30)
    expect(resolveBearingFromDrag(10, 350, 350)).toBe(330)
  })

  it('resolveCompassAzimuthLabel maps quadrants', () => {
    expect(resolveCompassAzimuthLabel(0)).toBe('正北')
    expect(resolveCompassAzimuthLabel(24)).toBe('北偏东')
    expect(resolveCompassAzimuthLabel(90)).toBe('正东')
    expect(resolveCompassAzimuthLabel(135)).toBe('东偏南')
    expect(resolveCompassAzimuthLabel(200)).toBe('南偏西')
    expect(resolveCompassAzimuthLabel(300)).toBe('西偏北')
  })

  it('snapCompassBearing only snaps to north', () => {
    expect(snapCompassBearing(358)).toBe(0)
    expect(snapCompassBearing(43)).toBe(43)
    expect(snapCompassBearing(88)).toBe(88)
    expect(snapCompassBearing(2)).toBe(0)
  })
})
