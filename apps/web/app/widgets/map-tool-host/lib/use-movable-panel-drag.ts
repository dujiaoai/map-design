import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

import { clampPanelOffset, type PanelOffset } from './clamp-panel-offset'

const ANCHOR_LEFT_PX = 12
const ANCHOR_TOP_PX = 56

interface DragSession {
  pointerId: number
  startClientX: number
  startClientY: number
  originX: number
  originY: number
}

export function useMovablePanelDrag(options: {
  enabled: boolean
  placement: 'left' | 'right'
  containerRef: RefObject<HTMLElement | null>
  panelRef: RefObject<HTMLElement | null>
  resetKey: string
}) {
  const [offset, setOffset] = useState<PanelOffset>({ x: 0, y: 0 })
  const sessionRef = useRef<DragSession | null>(null)

  useEffect(() => {
    setOffset({ x: 0, y: 0 })
  }, [options.resetKey])

  const clamp = useCallback(
    (next: PanelOffset): PanelOffset => {
      const container = options.containerRef.current
      const panel = options.panelRef.current
      if (!container || !panel) {
        return next
      }

      const containerRect = container.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()

      return clampPanelOffset({
        offset: next,
        containerWidth: containerRect.width,
        containerHeight: containerRect.height,
        panelWidth: panelRect.width,
        panelHeight: panelRect.height,
        anchorInset: ANCHOR_LEFT_PX,
        anchorTop: ANCHOR_TOP_PX,
        anchorSide: options.placement,
      })
    },
    [options.containerRef, options.panelRef, options.placement],
  )

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!options.enabled || event.button !== 0) {
        return
      }
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      sessionRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        originX: offset.x,
        originY: offset.y,
      }
    },
    [options.enabled, offset.x, offset.y],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const session = sessionRef.current
      if (!session || session.pointerId !== event.pointerId) {
        return
      }

      const rawDx = event.clientX - session.startClientX
      const dx = options.placement === 'right' ? -rawDx : rawDx
      const dy = event.clientY - session.startClientY
      setOffset(clamp({ x: session.originX + dx, y: session.originY + dy }))
    },
    [clamp, options.placement],
  )

  const endDrag = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const session = sessionRef.current
    if (!session || session.pointerId !== event.pointerId) {
      return
    }
    sessionRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  return {
    offset,
    anchorLeftPx: ANCHOR_LEFT_PX,
    anchorTopPx: ANCHOR_TOP_PX,
    dragHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  }
}
