import { useEffect, useRef, useState } from 'react'

import {
  resolveModuleSurfaceDirection,
  type ModuleSurfaceDirection,
} from './workspace-module-surface'

/** 侧栏模块切换时给出带方向的内容入场类名（列展开时不重复播） */
export function useWorkspaceModuleContentMotion(surfaceKey: string | null, panelOpen: boolean) {
  const previousKeyRef = useRef<string | null>(null)
  const [direction, setDirection] = useState<ModuleSurfaceDirection>('forward')
  const [isSwap, setIsSwap] = useState(false)

  useEffect(() => {
    const previousKey = previousKeyRef.current
    if (surfaceKey === previousKey) {
      return
    }

    setDirection(resolveModuleSurfaceDirection(previousKey, surfaceKey))
    setIsSwap(previousKey !== null && panelOpen)
    previousKeyRef.current = surfaceKey
  }, [surfaceKey, panelOpen])

  return {
    motionKey: surfaceKey ?? 'workspace-module-idle',
    direction,
    isSwap,
  }
}
