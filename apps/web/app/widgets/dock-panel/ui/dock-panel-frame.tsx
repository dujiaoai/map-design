import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { dockPanelAsideClass } from '../lib/dock-panel-layout'
import { DockPanelHeader } from './dock-panel-header'

/** 机库 / 业务 Dock 外壳；全屏时 Portal 至 document.body 覆盖整页 */
export function DockPanelFrame({
  title,
  fullscreen,
  onToggleFullscreen,
  onClose,
  onExitFullscreen,
  footer,
  children,
}: {
  title: string
  fullscreen: boolean
  onToggleFullscreen: () => void
  onClose: () => void
  /** store 退出全屏（如 Esc） */
  onExitFullscreen: () => void
  footer?: ReactNode
  children: ReactNode
}) {
  useEffect(() => {
    if (!fullscreen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onExitFullscreen()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [fullscreen, onExitFullscreen])

  const panel = (
    <aside className={dockPanelAsideClass(fullscreen)}>
      <DockPanelHeader
        title={title}
        fullscreen={fullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onClose={onClose}
      />
      {children}
      {footer}
    </aside>
  )

  if (fullscreen && typeof document !== 'undefined') {
    return createPortal(panel, document.body)
  }

  return panel
}
