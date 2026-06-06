import { useMemo, useRef } from 'react'

import { useMapWorkspaceStore } from '~/features/map-workspace'

import {
  buildMapToolEntries,
  partitionMapToolEntries,
  type MapToolEntry,
} from '../lib/build-map-tool-entries'
import { MapToolAnchorColumn } from './map-tool-anchor-column'
import { MovableToolPanel } from './movable-tool-panel'

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
