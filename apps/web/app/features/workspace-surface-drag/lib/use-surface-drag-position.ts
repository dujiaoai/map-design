import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import {
  clampSurfacePosition,
  getSurfaceMetrics,
  type SurfaceDragPosition,
} from './surface-drag-math'

export function useSurfaceDragPosition(options: {
  containerRef: RefObject<HTMLElement | null>
  elementRef: RefObject<HTMLElement | null>
  layoutKey: string
  isDragging: boolean
  readySignal: number
  initialPosition: SurfaceDragPosition
  needsLayout: (position: SurfaceDragPosition) => boolean
  resolveDefault: (container: HTMLElement, element: HTMLElement) => SurfaceDragPosition
  onPersist?: (position: SurfaceDragPosition) => void
}) {
  const [position, setPosition] = useState<SurfaceDragPosition>(options.initialPosition)

  const positionRef = useRef(position)
  positionRef.current = position

  const setCommittedPosition = useCallback(
    (next: SurfaceDragPosition) => {
      if (options.needsLayout(next)) {
        return
      }
      positionRef.current = next
      setPosition(next)
      options.onPersist?.(next)
    },
    [options.needsLayout, options.onPersist],
  )

  useLayoutEffect(() => {
    if (options.isDragging) {
      return
    }

    const container = options.containerRef.current
    const element = options.elementRef.current
    if (!container || !element) {
      return
    }

    const current = positionRef.current
    const resolved = options.needsLayout(current)
      ? options.resolveDefault(container, element)
      : clampSurfacePosition(current, getSurfaceMetrics(container, element))

    if (resolved.x !== current.x || resolved.y !== current.y) {
      setCommittedPosition(resolved)
    }
  }, [
    options.containerRef,
    options.elementRef,
    options.isDragging,
    options.layoutKey,
    options.needsLayout,
    options.readySignal,
    options.resolveDefault,
    setCommittedPosition,
  ])

  useEffect(() => {
    const container = options.containerRef.current
    if (!container) {
      return
    }

    function handleResize() {
      if (options.isDragging || options.needsLayout(positionRef.current)) {
        return
      }

      const containerEl = options.containerRef.current
      const element = options.elementRef.current
      if (!containerEl || !element) {
        return
      }

      const next = clampSurfacePosition(
        positionRef.current,
        getSurfaceMetrics(containerEl, element),
      )
      setCommittedPosition(next)
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [
    options.containerRef,
    options.elementRef,
    options.isDragging,
    options.needsLayout,
    setCommittedPosition,
  ])

  return {
    position,
    positionRef,
    setCommittedPosition,
  }
}
