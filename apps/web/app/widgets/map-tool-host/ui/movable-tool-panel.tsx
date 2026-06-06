import { DndContext, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@repo/ui'
import { useCallback, useRef, useState } from 'react'

import {
  createMovablePanelDragId,
  loadPanelSurfacePosition,
  NEEDS_LAYOUT_ANCHOR,
  PANEL_ANCHOR_TOP,
  resolveDefaultAnchoredPosition,
  savePanelSurfacePosition,
  useWorkspaceSurfaceDnd,
  WorkspaceSnapGuides,
} from '~/features/workspace-surface-drag'

import { MockToolContent } from '~/entities/mock-workspace-content'

import type { MapToolEntry } from '../lib/build-map-tool-entries'
import { mapToolColumnWidth } from '../lib/build-map-tool-entries'
import {
  MapToolPanelBody,
  MapToolPanelHeader,
  mapToolPanelShellClass,
} from './map-tool-panel-header'

function ToolPanelCardBody({
  entry,
  onClose,
  dragHandleProps,
  isDragging,
}: {
  entry: MapToolEntry
  onClose: () => void
  dragHandleProps?: React.ComponentProps<'button'>
  isDragging?: boolean
}) {
  const variantLabel =
    entry.variantKey === 'drawLine'
      ? '绘线模式'
      : entry.variantKey === 'drawSurface'
        ? '绘面模式'
        : null

  return (
    <aside
      className={mapToolPanelShellClass({ presentation: entry.presentation })}
      data-tool-id={entry.toolId}
      data-plugin-tool-id={entry.pluginToolId}
      data-presentation={entry.presentation}
    >
      <MapToolPanelHeader
        title={entry.title}
        variantLabel={variantLabel}
        onClose={onClose}
        dragHandleProps={dragHandleProps}
        isDragging={isDragging}
      />
      <MapToolPanelBody>
        <MockToolContent
          toolId={entry.toolId}
          navItemId={entry.navItemId}
          title={entry.title}
          pluginToolId={entry.pluginToolId}
          variantKey={entry.variantKey}
        />
      </MapToolPanelBody>
    </aside>
  )
}

export function MovableToolPanel({
  entry,
  containerRef,
  onClose,
}: {
  entry: MapToolEntry
  containerRef: React.RefObject<HTMLElement | null>
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [readySignal, setReadySignal] = useState(0)
  const dragId = createMovablePanelDragId(entry.navItemId)

  const surface = useWorkspaceSurfaceDnd({
    dragId,
    containerRef,
    elementRef: panelRef,
    layoutKey: entry.navItemId,
    readySignal,
    initialPosition: loadPanelSurfacePosition(entry.navItemId) ?? {
      x: NEEDS_LAYOUT_ANCHOR,
      y: PANEL_ANCHOR_TOP,
    },
    needsLayout: (position) => position.x === NEEDS_LAYOUT_ANCHOR,
    resolveDefault: (container, element) =>
      resolveDefaultAnchoredPosition(entry.placement, container, element),
    onPersist: (position) => savePanelSurfacePosition(entry.navItemId, position),
  })

  return (
    <DndContext
      sensors={surface.sensors}
      modifiers={[...surface.modifiers]}
      onDragStart={surface.onDragStart}
      onDragMove={surface.onDragMove}
      onDragEnd={surface.onDragEnd}
      onDragCancel={surface.onDragCancel}
    >
      <MovableToolPanelDraggable
        entry={entry}
        dragId={dragId}
        panelRef={panelRef}
        containerRef={containerRef}
        position={surface.position}
        isDragging={surface.isDragging}
        containerWidth={surface.containerWidth}
        activeSnapX={surface.activeSnapX}
        activeSnapY={surface.activeSnapY}
        onPanelReady={() => setReadySignal((value) => value + 1)}
        onClose={onClose}
      />
    </DndContext>
  )
}

function MovableToolPanelDraggable({
  entry,
  dragId,
  panelRef,
  containerRef,
  position,
  isDragging,
  containerWidth,
  activeSnapX,
  activeSnapY,
  onPanelReady,
  onClose,
}: {
  entry: MapToolEntry
  dragId: string
  panelRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLElement | null>
  position: { x: number; y: number }
  isDragging: boolean
  containerWidth: number
  activeSnapX: ReturnType<typeof useWorkspaceSurfaceDnd>['activeSnapX']
  activeSnapY: ReturnType<typeof useWorkspaceSurfaceDnd>['activeSnapY']
  onPanelReady: () => void
  onClose: () => void
}) {
  const hasReportedReadyRef = useRef(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isNodeDragging,
  } = useDraggable({ id: dragId })

  const mergePanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node)
      panelRef.current = node
      containerRef.current = node?.closest('.workspace-canvas') ?? containerRef.current
      if (node && !hasReportedReadyRef.current) {
        hasReportedReadyRef.current = true
        onPanelReady()
      }
    },
    [containerRef, onPanelReady, panelRef, setNodeRef],
  )

  const dragging = isDragging || isNodeDragging

  return (
    <>
      {dragging && containerWidth > 0 ? (
        <WorkspaceSnapGuides
          containerWidth={containerWidth}
          activeSnapX={activeSnapX}
          activeSnapY={activeSnapY}
        />
      ) : null}

      <div
        ref={mergePanelRef}
        className={cn(
          'pointer-events-auto absolute z-20 touch-none',
          mapToolColumnWidth(entry.placement),
          dragging && 'workspace-surface-dragging',
        )}
        style={{
          left: Math.max(0, position.x),
          top: Math.max(0, position.y),
          transform: transform ? CSS.Translate.toString(transform) : undefined,
        }}
      >
        <ToolPanelCardBody
          entry={entry}
          onClose={onClose}
          dragHandleProps={{ ...attributes, ...listeners }}
          isDragging={dragging}
        />
      </div>
    </>
  )
}
