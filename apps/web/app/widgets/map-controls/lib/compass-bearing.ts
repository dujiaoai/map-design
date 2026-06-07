/** 归一化到 [0, 360) */
export function normalizeBearing(bearing: number) {
  return ((bearing % 360) + 360) % 360
}

export function isNorthBearing(bearing: number, tolerance = 0.5) {
  const normalized = normalizeBearing(bearing)
  return normalized <= tolerance || normalized >= 360 - tolerance
}

/** 指针相对罗盘中心的方位角（0° = 正北，顺时针） */
export function getPointerBearingAngle(
  element: HTMLElement,
  clientX: number,
  clientY: number,
) {
  const rect = element.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = clientX - cx
  const dy = clientY - cy
  const radians = Math.atan2(dx, -dy)
  return normalizeBearing((radians * 180) / Math.PI)
}

export function resolveBearingFromDrag(
  startAngle: number,
  startBearing: number,
  currentAngle: number,
) {
  let delta = currentAngle - startAngle
  if (delta > 180) {
    delta -= 360
  } else if (delta < -180) {
    delta += 360
  }
  return normalizeBearing(startBearing + delta)
}

/** 释放时仅吸附正北（Mapbox 风格） */
export function snapCompassBearing(bearing: number, threshold = 4) {
  const normalized = normalizeBearing(bearing)
  const distanceToNorth = Math.min(normalized, 360 - normalized)
  return distanceToNorth <= threshold ? 0 : normalized
}

export const COMPASS_DRAG_THRESHOLD_PX = 4

const COMPASS_AZIMUTH_CARDINAL_TOLERANCE = 1

/** 地图方位名（顺时针偏离正北的角度 → 象限方位） */
export function resolveCompassAzimuthLabel(bearing: number): string {
  const normalized = normalizeBearing(bearing)
  const rounded = Math.round(normalized)

  if (isNorthBearing(rounded, COMPASS_AZIMUTH_CARDINAL_TOLERANCE)) {
    return '正北'
  }
  if (Math.abs(rounded - 90) <= COMPASS_AZIMUTH_CARDINAL_TOLERANCE) {
    return '正东'
  }
  if (Math.abs(rounded - 180) <= COMPASS_AZIMUTH_CARDINAL_TOLERANCE) {
    return '正南'
  }
  if (Math.abs(rounded - 270) <= COMPASS_AZIMUTH_CARDINAL_TOLERANCE) {
    return '正西'
  }
  if (normalized > 0 && normalized < 90) {
    return '北偏东'
  }
  if (normalized > 90 && normalized < 180) {
    return '东偏南'
  }
  if (normalized > 180 && normalized < 270) {
    return '南偏西'
  }
  return '西偏北'
}

export function formatCompassBearingHint(bearing: number): string {
  const rounded = Math.round(normalizeBearing(bearing))
  return `${rounded}° · ${resolveCompassAzimuthLabel(bearing)}`
}
