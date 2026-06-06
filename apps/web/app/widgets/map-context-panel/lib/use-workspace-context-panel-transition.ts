import { useEffect, useState } from 'react'

export const WORKSPACE_CONTEXT_PANEL_MS = 340

type PanelPhase = 'idle' | 'enter' | 'open' | 'exit'

/** 上下文列展开/收起时保持挂载以播放退出动画 */
export function useWorkspaceContextPanelTransition(isOpen: boolean) {
  const [mounted, setMounted] = useState(false)
  const [phase, setPhase] = useState<PanelPhase>('idle')

  useEffect(() => {
    if (!isOpen) {
      setPhase((current) => (current === 'idle' ? 'idle' : 'exit'))
      return
    }

    setMounted(true)
    setPhase('enter')

    let frame2 = 0
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setPhase('open')
      })
    })

    return () => {
      cancelAnimationFrame(frame1)
      if (frame2) cancelAnimationFrame(frame2)
    }
  }, [isOpen])

  useEffect(() => {
    if (phase !== 'exit') {
      return
    }

    const timer = window.setTimeout(() => {
      setMounted(false)
      setPhase('idle')
    }, WORKSPACE_CONTEXT_PANEL_MS)

    return () => window.clearTimeout(timer)
  }, [phase])

  return {
    mounted,
    open: phase === 'open',
    exiting: phase === 'exit',
    phase,
  }
}
