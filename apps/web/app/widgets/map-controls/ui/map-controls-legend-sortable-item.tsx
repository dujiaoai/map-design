import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@repo/ui'
import { GripVerticalIcon } from 'lucide-react'

import { WORKSPACE_CHROME_ICON_TONE_CLASS } from '~/shared/lib/workspace-chrome-styles'

import type { MapControlLegendItem, MapControlLegendSymbol } from '../lib/map-control-legend'

function LegendSymbol({
  symbol,
  swatchClass,
}: {
  symbol: MapControlLegendSymbol
  swatchClass: string
}) {
  const box = 'mt-0.5 h-2.5 w-3.5 shrink-0'

  if (symbol === 'line') {
    return (
      <span className={cn('flex shrink-0 items-center', box)} aria-hidden>
        <span className={cn('h-px w-full rounded-full', swatchClass)} />
      </span>
    )
  }

  if (symbol === 'dashed') {
    return (
      <span
        className={cn('shrink-0 rounded-[1px] border border-dashed', box, swatchClass)}
        aria-hidden
      />
    )
  }

  if (symbol === 'point') {
    return (
      <span className={cn('flex shrink-0 items-center justify-center', box)} aria-hidden>
        <span className={cn('size-1.5 rounded-full ring-1 ring-background/80', swatchClass)} />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'shrink-0 rounded-[1px] ring-1 ring-foreground/10 dark:ring-white/12',
        box,
        swatchClass,
      )}
      aria-hidden
    />
  )
}

export function MapControlsLegendSortableItem({
  item,
  disabled,
}: {
  item: MapControlLegendItem
  disabled: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  })

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'map-controls-legend-wing__item flex min-w-0 items-start gap-0.5 rounded-[3px] px-0.5 py-0.5',
        isDragging && 'map-controls-legend-wing__item--dragging z-10 opacity-95 shadow-sm',
      )}
    >
      <button
        type="button"
        aria-label={`拖动图例项 ${item.label}`}
        className={cn(
          'mt-px flex size-4 shrink-0 cursor-grab items-center justify-center rounded-[3px] touch-none select-none active:cursor-grabbing',
          WORKSPACE_CHROME_ICON_TONE_CLASS,
          isDragging && 'cursor-grabbing bg-accent/80',
          disabled && 'pointer-events-none opacity-40',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-2.5 opacity-60" strokeWidth={2.25} />
      </button>
      <LegendSymbol symbol={item.symbol} swatchClass={item.swatchClass} />
      <span className="text-foreground/80 min-w-0 flex-1 break-words text-[10px] leading-snug dark:text-white/75">
        {item.label}
      </span>
    </li>
  )
}
