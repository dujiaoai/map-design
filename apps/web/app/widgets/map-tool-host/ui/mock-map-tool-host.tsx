import { cn } from '@haoxuan/ui'
import { type ComponentPropsWithoutRef, useMemo, useRef } from 'react'

import { useMapWorkspaceStore } from '~/features/map-workspace'

import {
  buildMapToolEntries,
  formatVariantLabel,
  partitionMapToolEntries,
  type MapToolEntry,
  mapToolColumnWidth,
} from '../lib/build-map-tool-entries'
import { useMovablePanelDrag } from '../lib/use-movable-panel-drag'
import { MapToolPanelHeader, mapToolPanelShellClass } from './map-tool-panel-header'

function ToolPanelCardBody({
  entry,
  onClose,
  dragHandleProps,
}: {
  entry: MapToolEntry
  onClose: () => void
  dragHandleProps?: ComponentPropsWithoutRef<'button'>
}) {
  const variantLabel = formatVariantLabel(entry.variantKey)
  const isMovable = entry.presentation === 'movable-panel'

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
        dragHandleProps={isMovable ? dragHandleProps : undefined}
        reserveDragSlot={!isMovable}
      />
      <div className="text-muted-foreground space-y-1 overflow-y-auto px-3 py-2 text-sm">
        <p>
          地图互斥工具占位：{entry.title}（plugin: {entry.pluginToolId}）
        </p>
        <p className="text-xs">
          {isMovable
            ? '拖动手柄可移动面板；在地图上点击绘制，双击结束线/面。退出请用右下角操作条或侧栏再次点击。'
            : '锚点面板同侧垂直堆叠；退出请用右下角操作条或侧栏再次点击。'}
        </p>
      </div>
    </aside>
  )
}

function MovableToolPanel({
  entry,
  containerRef,
  onClose,
}: {
  entry: MapToolEntry
  containerRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  const { offset, dragHandleProps } = useMovablePanelDrag({
    enabled: true,
    placement: entry.placement,
    containerRef,
    panelRef,
    resetKey: entry.navItemId,
  })

  const sideClass = entry.placement === 'left' ? 'left-3' : 'right-3'
  const translateX = entry.placement === 'right' ? -offset.x : offset.x

  return (
    <div
      ref={panelRef}
      className={cn(
        'pointer-events-auto absolute top-14',
        sideClass,
        mapToolColumnWidth(entry.placement),
      )}
      style={{
        transform: `translate(${translateX}px, ${offset.y}px)`,
      }}
    >
      <ToolPanelCardBody entry={entry} onClose={onClose} dragHandleProps={dragHandleProps} />
    </div>
  )
}

function MapToolAnchorColumn({
  placement,
  entries,
  onCloseEntry,
}: {
  placement: 'left' | 'right'
  entries: MapToolEntry[]
  onCloseEntry: (entry: MapToolEntry) => void
}) {
  if (entries.length === 0) {
    return null
  }

  const sideClass = placement === 'left' ? 'left-3' : 'right-3'

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-14 z-20 flex max-h-[calc(100%-4rem)] flex-col gap-2 overflow-y-auto',
        sideClass,
        mapToolColumnWidth(placement),
      )}
      role="region"
      aria-label={placement === 'left' ? '左侧地图工具' : '右侧地图工具'}
    >
      {entries.map((entry) => (
        <div key={entry.navItemId} className="pointer-events-auto">
          <ToolPanelCardBody entry={entry} onClose={() => onCloseEntry(entry)} />
        </div>
      ))}
    </div>
  )
}

/** L3 地图互斥工具浮层：movable-panel 可拖动，anchor 面板同侧堆叠 */
export function MockMapToolHost() {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const activeMapTool = useMapWorkspaceStore((state) => state.activeMapTool)
  const activePanelTools = useMapWorkspaceStore((state) => state.activePanelTools)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const togglePanelTool = useMapWorkspaceStore((state) => state.togglePanelTool)

  const { movable, anchorByPlacement } = useMemo(() => {
    const entries = buildMapToolEntries({ activeMapTool, activePanelTools })
    return partitionMapToolEntries(entries)
  }, [activeMapTool, activePanelTools])

  const hasContent =
    movable.length > 0 ||
    anchorByPlacement.left.length > 0 ||
    anchorByPlacement.right.length > 0

  if (!hasContent) {
    return null
  }

  function handleCloseEntry(entry: MapToolEntry) {
    if (activeMapTool?.navItemId === entry.navItemId) {
      toggleMapTool(entry.navItemId)
      return
    }
    togglePanelTool(entry.navItemId, entry.toolId)
  }

  return (
    <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-20">
      {movable.map((entry) => (
        <MovableToolPanel
          key={entry.navItemId}
          entry={entry}
          containerRef={overlayRef}
          onClose={() => handleCloseEntry(entry)}
        />
      ))}
      <MapToolAnchorColumn
        placement="left"
        entries={anchorByPlacement.left}
        onCloseEntry={handleCloseEntry}
      />
      <MapToolAnchorColumn
        placement="right"
        entries={anchorByPlacement.right}
        onCloseEntry={handleCloseEntry}
      />
    </div>
  )
}
