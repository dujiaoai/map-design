import { useEffect, useState } from 'react'

import type { ActiveDrawerTool } from '~/features/map-workspace'

export const MAP_TOOL_DRAWER_ANIMATION_MS = 300

type DrawerPhase = 'idle' | 'enter' | 'open' | 'exit'

/** 保持挂载以播放关闭动画，再卸载面板 */
export function useMapToolDrawerTransition(active: ActiveDrawerTool | null) {
  const [panel, setPanel] = useState<ActiveDrawerTool | null>(null)
  const [phase, setPhase] = useState<DrawerPhase>('idle')

  useEffect(() => {
    if (!active) {
      if (panel) {
        setPhase('exit')
      }
      return
    }

    setPanel(active)
    setPhase('enter')
    const frame = requestAnimationFrame(() => {
      setPhase('open')
    })
    return () => cancelAnimationFrame(frame)
  }, [active, panel])

  useEffect(() => {
    if (phase !== 'exit') {
      return
    }
    const timer = window.setTimeout(() => {
      setPanel(null)
      setPhase('idle')
    }, MAP_TOOL_DRAWER_ANIMATION_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  const open = phase === 'enter' || phase === 'open'
  const exiting = phase === 'exit'

  return {
    panel,
    open,
    exiting,
    mounted: panel !== null,
  }
}
