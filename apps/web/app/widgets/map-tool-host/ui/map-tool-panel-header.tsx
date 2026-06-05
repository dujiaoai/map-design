import { cn } from '@haoxuan/ui'
import { GripVerticalIcon, XIcon } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'

import {
  DOCK_PANEL_HEADER_HEIGHT_CLASS,
  DOCK_PANEL_ICON_BUTTON_CLASS,
} from '~/widgets/dock-panel'

export function MapToolPanelHeader({
  title,
  variantLabel,
  onClose,
  dragHandleProps,
  reserveDragSlot = false,
  className,
}: {
  title: string
  variantLabel?: string | null
  onClose: () => void
  /** movable-panel：拖动手柄事件 */
  dragHandleProps?: ComponentPropsWithoutRef<'button'>
  /** anchor 面板：占位与 movable 标题左缘对齐 */
  reserveDragSlot?: boolean
  className?: string
}) {
  const showDragSlot = Boolean(dragHandleProps) || reserveDragSlot

  return (
    <div
      role="toolbar"
      aria-label={`${title}工具面板`}
      className={cn(
        'border-border flex shrink-0 items-center gap-0.5 border-b px-1.5',
        DOCK_PANEL_HEADER_HEIGHT_CLASS,
        className,
      )}
    >
      {showDragSlot ? (
        dragHandleProps ? (
          <button
            type="button"
            aria-label={`拖动${title}面板`}
            title="拖动面板"
            className={cn(
              DOCK_PANEL_ICON_BUTTON_CLASS,
              'cursor-grab touch-none active:cursor-grabbing',
            )}
            {...dragHandleProps}
          >
            <GripVerticalIcon className="size-3.5" aria-hidden />
          </button>
        ) : (
          <span className="size-8 shrink-0" aria-hidden />
        )
      ) : null}
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden px-1">
        {variantLabel ? (
          <span className="bg-muted text-muted-foreground shrink-0 rounded px-1 py-0.5 text-[10px] leading-none font-medium">
            {variantLabel}
          </span>
        ) : null}
        <h2 className="min-w-0 truncate text-sm font-medium">{title}</h2>
      </div>
      <button
        type="button"
        aria-label={`关闭${title}`}
        title={`关闭${title}`}
        onClick={onClose}
        className={DOCK_PANEL_ICON_BUTTON_CLASS}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}

/** 地图工具浮层外壳：单层 border，避免 Card 双层 ring */
export function mapToolPanelShellClass(options: {
  presentation: 'movable-panel' | 'anchor'
}): string {
  return cn(
    'border-border bg-background/95 flex max-h-[min(420px,50vh)] shrink-0 flex-col overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm',
    options.presentation === 'movable-panel' && 'border-primary/30',
  )
}
