import { cn } from '@repo/ui'

import {
  formatVariantLabel,
  mapToolColumnWidth,
  type MapToolEntry,
} from '../lib/build-map-tool-entries'
import { MapToolPanelHeader, mapToolPanelShellClass } from './map-tool-panel-header'

function ToolPanelCardBody({
  entry,
  onClose,
}: {
  entry: MapToolEntry
  onClose: () => void
}) {
  return (
    <aside
      className={mapToolPanelShellClass({ presentation: entry.presentation })}
      data-tool-id={entry.toolId}
      data-plugin-tool-id={entry.pluginToolId}
      data-presentation={entry.presentation}
    >
      <MapToolPanelHeader
        title={entry.title}
        variantLabel={formatVariantLabel(entry.variantKey)}
        onClose={onClose}
        reserveDragSlot
      />
      <div className="text-muted-foreground space-y-1 overflow-y-auto px-3 py-2 text-sm">
        <p>
          地图互斥工具占位：{entry.title}（plugin: {entry.pluginToolId}）
        </p>
        <p className="text-xs">锚点面板同侧垂直堆叠；退出请用底栏或侧栏再次点击。</p>
      </div>
    </aside>
  )
}

export function MapToolAnchorColumn({
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
