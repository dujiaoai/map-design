import {
  type DragEndEvent,
  type DragMoveEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  clampSurfacePosition,
  createSurfaceSnapModifier,
  getSurfaceMetrics,
  snapSurfacePosition,
  type SurfaceDragMetrics,
  type SurfaceDragPosition,
  type SurfaceSnapX,
  type SurfaceSnapY,
} from './surface-drag-math'

export function useWorkspaceDndSensors(options?: { enableKeyboard?: boolean }) {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    ...(options?.enableKeyboard
      ? [
          useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
          }),
        ]
      : []),
  )
}

export function useWorkspaceSurfaceDnd(options: {
  dragId: string
  containerRef: RefObject<HTMLElement | null>
  elementRef: RefObject<HTMLElement | null>
  layoutKey: string
  readySignal: number
  initialPosition: SurfaceDragPosition
  needsLayout: (position: SurfaceDragPosition) => boolean
  resolveDefault: (container: HTMLElement, element: HTMLElement) => SurfaceDragPosition
  onPersist?: (position: SurfaceDragPosition) => void
  onPersistReset?: () => void
  layoutResetPosition?: SurfaceDragPosition
  enableKeyboardSensor?: boolean
  onDragEnd?: (event: DragEndEvent) => void
}) {
  const [position, setPosition] = useState<SurfaceDragPosition>(options.initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [activeSnapX, setActiveSnapX] = useState<SurfaceSnapX | null>(null)
  const [activeSnapY, setActiveSnapY] = useState<SurfaceSnapY | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  const positionRef = useRef(position)
  positionRef.current = position

  const snapGuideRef = useRef<{ snapX: SurfaceSnapX | null; snapY: SurfaceSnapY | null }>({
    snapX: null,
    snapY: null,
  })

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

  const getMetrics = useCallback((): SurfaceDragMetrics | null => {
    const container = options.containerRef.current
    const element = options.elementRef.current
    if (!container || !element) {
      return null
    }
    return getSurfaceMetrics(container, element)
  }, [options.containerRef, options.elementRef])

  useLayoutEffect(() => {
    if (isDragging) {
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
    isDragging,
    options.containerRef,
    options.elementRef,
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
      if (isDragging || options.needsLayout(positionRef.current)) {
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
    isDragging,
    options.containerRef,
    options.elementRef,
    options.needsLayout,
    setCommittedPosition,
  ])

  const snapModifier = useMemo(
    () =>
      createSurfaceSnapModifier({
        dragId: options.dragId,
        getBasePosition: () => positionRef.current,
        getMetrics,
      }),
    [getMetrics, options.dragId],
  )

  const updateSnapGuides = useCallback(
    (delta: { x: number; y: number }) => {
      const metrics = getMetrics()
      if (!metrics) {
        return
      }

      const raw = {
        x: positionRef.current.x + delta.x,
        y: positionRef.current.y + delta.y,
      }
      const { snapX, snapY } = snapSurfacePosition(raw, metrics)
      const prev = snapGuideRef.current
      if (prev.snapX === snapX && prev.snapY === snapY) {
        return
      }
      snapGuideRef.current = { snapX, snapY }
      setActiveSnapX(snapX)
      setActiveSnapY(snapY)
    },
    [getMetrics],
  )

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      if (String(event.active.id) !== options.dragId) {
        return
      }
      updateSnapGuides(event.delta)
    },
    [options.dragId, updateSnapGuides],
  )

  const sensors = useWorkspaceDndSensors({ enableKeyboard: options.enableKeyboardSensor })

  const resetDragUi = useCallback(() => {
    setIsDragging(false)
    setActiveSnapX(null)
    setActiveSnapY(null)
  }, [])

  const resetPosition = useCallback(() => {
    const next = options.layoutResetPosition ?? options.initialPosition
    positionRef.current = next
    setPosition(next)
    options.onPersistReset?.()
  }, [options.initialPosition, options.layoutResetPosition, options.onPersistReset])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const activeId = String(event.active.id)

      if (activeId === options.dragId) {
        const container = options.containerRef.current
        const metrics = getMetrics()
        const translated = event.active.rect.current.translated

        if (container && metrics && translated) {
          const containerRect = container.getBoundingClientRect()
          const raw = {
            x: translated.left - containerRect.left,
            y: translated.top - containerRect.top,
          }
          setCommittedPosition(snapSurfacePosition(raw, metrics).position)
        }
      }

      options.onDragEnd?.(event)
      resetDragUi()
    },
    [getMetrics, options, resetDragUi, setCommittedPosition],
  )

  return {
    position,
    positionRef,
    isDragging,
    activeSnapX,
    activeSnapY,
    containerWidth,
    sensors,
    modifiers: [restrictToParentElement, snapModifier] as const,
    onDragStart: ({ active }: { active: { id: string | number } }) => {
      if (String(active.id) !== options.dragId) {
        return
      }
      setIsDragging(true)
      const container = options.containerRef.current
      if (container) {
        setContainerWidth(container.clientWidth)
      }
    },
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onDragCancel: resetDragUi,
    resetPosition,
  }
}
