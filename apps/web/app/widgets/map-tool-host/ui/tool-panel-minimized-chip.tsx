import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui'
import { GripVerticalIcon, XIcon } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'

import { DOCK_PANEL_ICON_BUTTON_CLASS } from '~/widgets/dock-panel'

import type { MapToolEntry } from '../lib/build-map-tool-entries'

export function ToolPanelMinimizedChip({
  entry,
  onExpand,
  onClose,
  dragHandleProps,
  isDragging = false,
  summary,
}: {
  entry: MapToolEntry
  onExpand: () => void
  onClose: () => void
  dragHandleProps?: ComponentPropsWithoutRef<'button'>
  isDragging?: boolean
  summary?: string | null
}) {
  return (
    <div
      className={cn(
        'cc-glass-panel border-primary/30 flex max-w-[min(18rem,calc(100vw-2rem))] items-center gap-0.5 rounded-full p-1 backdrop-blur-sm',
        isDragging && 'workspace-surface-dragging shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
      )}
      data-tool-id={entry.toolId}
      data-presentation={entry.presentation}
      data-minimized
    >
      {dragHandleProps ? (
        <button
          type="button"
          aria-label={`拖动${entry.title}浮标`}
          title="拖动浮标"
          className={cn(
            DOCK_PANEL_ICON_BUTTON_CLASS,
            'cursor-grab touch-none active:cursor-grabbing',
            isDragging && 'cursor-grabbing',
          )}
          {...dragHandleProps}
        >
          <GripVerticalIcon className="size-3.5" aria-hidden />
        </button>
      ) : null}

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label={`展开${entry.title}`}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-2 rounded-full px-2 py-1.5 text-left transition-colors',
                'hover:bg-accent/70 dark:hover:bg-white/8',
              )}
              onClick={onExpand}
            >
              <span className="truncate text-sm font-medium">{entry.title}</span>
              {summary ? (
                <span className="text-muted-foreground cc-mono shrink-0 text-[11px] tabular-nums">
                  {summary}
                </span>
              ) : (
                <span className="text-muted-foreground shrink-0 text-[11px]">进行中</span>
              )}
            </button>
          }
        />
        <TooltipContent side="bottom">点击展开面板</TooltipContent>
      </Tooltip>

      <button
        type="button"
        aria-label={`关闭${entry.title}`}
        title={`关闭${entry.title}`}
        onClick={onClose}
        className={DOCK_PANEL_ICON_BUTTON_CLASS}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}
