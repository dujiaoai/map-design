const SECTION_MOTION_ORDER: Record<string, number> = {
  data: 0,
  uav: 1,
  ops: 2,
}

export type ModuleSurfaceDirection = 'forward' | 'back'

export function resolveModuleSurfaceDirection(
  previousKey: string | null,
  nextKey: string | null,
): ModuleSurfaceDirection {
  if (!previousKey || !nextKey || previousKey === nextKey) {
    return 'forward'
  }
  const prevOrder = surfaceMotionOrder(previousKey)
  const nextOrder = surfaceMotionOrder(nextKey)
  return nextOrder >= prevOrder ? 'forward' : 'back'
}

function surfaceMotionOrder(surfaceKey: string): number {
  const section = surfaceKey.split(':')[0]
  return SECTION_MOTION_ORDER[section] ?? 0
}
