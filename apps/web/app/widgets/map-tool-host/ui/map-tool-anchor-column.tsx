import { cn } from '@repo/ui'

import { MockToolContent } from '~/entities/mock-workspace-content'

import {
  formatVariantLabel,
  mapToolColumnWidth,
  type MapToolEntry,
} from '../lib/build-map-tool-entries'
import {
  MapToolPanelBody,
  MapToolPanelHeader,
  mapToolPanelShellClass,
} from './map-tool-panel-header'

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
