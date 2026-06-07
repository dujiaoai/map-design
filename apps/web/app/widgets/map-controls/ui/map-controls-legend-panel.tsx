import { DndContext, useDraggable } from '@dnd-kit/core'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui'
import { GripHorizontalIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import {
  loadPanelSurfacePosition,
  savePanelSurfacePosition,
  useWorkspaceSurfaceDnd,
  WorkspaceSnapGuides,
} from '~/features/workspace-surface-drag'
import { WORKSPACE_CHROME_ICON_TONE_CLASS } from '~/shared/lib/workspace-chrome-styles'

import type { MapControlLegendItem } from '../lib/map-control-legend'
import { useMapControlLegendStore } from '../lib/map-control-legend-store'
import {
  DEFAULT_MAP_CONTROLS_LEGEND_WING_POSITION,
  MAP_CONTROLS_LEGEND_WING_DRAG_ID,
  MAP_CONTROLS_LEGEND_WING_STORAGE_KEY,
  needsMapControlsLegendWingLayout,
  resolveDefaultMapControlsLegendWingPosition,
} from '../lib/map-controls-legend-surface'
import { MapControlsLegendSortableItem } from './map-controls-legend-sortable-item'

function LegendEmptyState() {
  return (
    <p className="text-muted-foreground col-span-2 px-1 py-2 text-center text-[10px] dark:text-white/45">
      暂无图例项
    </p>
  )
}

function MapControlsLegendWingDraggable({
  items,
  onClose,
  wingRef,
  surface,
  onWingReady,
}: {
  items: MapControlLegendItem[]
  onClose: () => void
  wingRef: React.RefObject<HTMLDivElement | null>
  surface: ReturnType<typeof useWorkspaceSurfaceDnd>
  onWingReady: () => void
}) {
  const hasReportedReadyRef = useRef(false)
  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isNodeDragging,
  } = useDraggable({
    id: MAP_CONTROLS_LEGEND_WING_DRAG_ID,
  })

  const wingDragging = surface.isDragging || isNodeDragging
  const itemsSortableDisabled = wingDragging

  const mergeWingRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node)
      wingRef.current = node
      if (node && !hasReportedReadyRef.current) {
        hasReportedReadyRef.current = true
        onWingReady()
      }
    },
    [onWingReady, setNodeRef, wingRef],
  )

  const dragHandle = (
    <div className="flex shrink-0 items-center">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="拖动图例"
              className={cn(
                'flex size-5 shrink-0 cursor-grab items-center justify-center rounded-[4px] touch-none select-none active:cursor-grabbing',
                WORKSPACE_CHROME_ICON_TONE_CLASS,
                wingDragging && 'cursor-grabbing bg-accent/80',
              )}
              {...listeners}
              {...attributes}
            >
              <GripHorizontalIcon className="size-3 opacity-70" strokeWidth={2.25} />
            </button>
          }
        />
        <TooltipContent side="top" className="text-[11px]">
          拖动图例（靠近边缘/中线自动对齐）
        </TooltipContent>
      </Tooltip>
    </div>
  )

  return (
    <>
      {wingDragging && surface.containerWidth > 0 ? (
        <WorkspaceSnapGuides
          containerWidth={surface.containerWidth}
          activeSnapX={surface.activeSnapX}
          activeSnapY={surface.activeSnapY}
        />
      ) : null}

      <div
        ref={mergeWingRef}
        className={cn(
          'map-controls-legend-wing cc-glass-panel pointer-events-auto touch-none',
          wingDragging &&
            'map-controls-legend-wing--dragging workspace-surface-dragging shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
        )}
        style={{
          left: Math.max(0, surface.position.x),
          top: Math.max(0, surface.position.y),
          transform: transform ? CSS.Translate.toString(transform) : undefined,
        }}
        role="dialog"
        aria-modal="false"
        aria-label={`地图图例，共 ${items.length} 项`}
      >
        <header className="map-controls-legend-wing__header flex shrink-0 items-center gap-0.5 px-1.5 py-1">
          {dragHandle}
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden px-0.5">
            <span className="text-foreground/80 truncate text-[10px] font-medium leading-none dark:text-white/85">
              图例
            </span>
            <span className="text-muted-foreground cc-mono shrink-0 text-[10px] leading-none tabular-nums dark:text-white/45">
              {items.length}
            </span>
          </div>
          <button
            type="button"
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-[4px] transition-colors',
              WORKSPACE_CHROME_ICON_TONE_CLASS,
            )}
            aria-label="关闭图例"
            onClick={onClose}
          >
            <XIcon className="size-3" strokeWidth={2.25} />
          </button>
        </header>

        <div className="map-controls-legend-wing__body">
          <SortableContext items={itemIds} strategy={rectSortingStrategy}>
            <ul className="map-controls-legend-wing__list">
              {items.length === 0 ? (
                <LegendEmptyState />
              ) : (
                items.map((item) => (
                  <MapControlsLegendSortableItem
                    key={item.id}
                    item={item}
                    disabled={itemsSortableDisabled}
                  />
                ))
              )}
            </ul>
          </SortableContext>
        </div>
      </div>
    </>
  )
}

/** 图例翼：@dnd-kit 画布拖动 + sortable 项排序（与快捷工具条同一套 surface DnD） */
export function MapControlsLegendWing({
  open,
  items,
  onClose,
}: {
  open: boolean
  items: MapControlLegendItem[]
  onClose: () => void
}) {
  const reorderItems = useMapControlLegendStore((state) => state.reorderItems)
  const containerRef = useRef<HTMLElement | null>(null)
  const wingRef = useRef<HTMLDivElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [readySignal, setReadySignal] = useState(0)

  const surface = useWorkspaceSurfaceDnd({
    dragId: MAP_CONTROLS_LEGEND_WING_DRAG_ID,
    containerRef,
    elementRef: wingRef,
    layoutKey: `legend-wing|${items.map((item) => item.id).join('|')}`,
    readySignal,
    initialPosition:
      loadPanelSurfacePosition(MAP_CONTROLS_LEGEND_WING_STORAGE_KEY) ??
      DEFAULT_MAP_CONTROLS_LEGEND_WING_POSITION,
    needsLayout: needsMapControlsLegendWingLayout,
    resolveDefault: resolveDefaultMapControlsLegendWingPosition,
    onPersist: (position) => savePanelSurfacePosition(MAP_CONTROLS_LEGEND_WING_STORAGE_KEY, position),
    enableKeyboardSensor: true,
    onDragEnd: (event) => {
      const activeId = String(event.active.id)
      const overId = event.over ? String(event.over.id) : null
      if (
        activeId !== MAP_CONTROLS_LEGEND_WING_DRAG_ID &&
        overId &&
        activeId !== overId
      ) {
        reorderItems(activeId, overId)
      }
    },
  })

  useLayoutEffect(() => {
    if (!open) {
      return
    }
    const canvas = document.querySelector<HTMLElement>('.workspace-canvas')
    containerRef.current = canvas
    setPortalTarget(canvas)
    setReadySignal((value) => value + 1)
  }, [open, items.length])

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) {
      return
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, handleEscape])

  if (!open || !portalTarget) {
    return null
  }

  return createPortal(
    <TooltipProvider delay={350}>
      <DndContext
        sensors={surface.sensors}
        modifiers={[...surface.modifiers]}
        onDragStart={surface.onDragStart}
        onDragMove={surface.onDragMove}
        onDragEnd={surface.onDragEnd}
        onDragCancel={surface.onDragCancel}
      >
        <MapControlsLegendWingDraggable
          items={items}
          onClose={onClose}
          wingRef={wingRef}
          surface={surface}
          onWingReady={() => setReadySignal((value) => value + 1)}
        />
      </DndContext>
    </TooltipProvider>,
    portalTarget,
  )
}
