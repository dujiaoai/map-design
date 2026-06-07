import { cn } from '@repo/ui'
import { GripVerticalIcon, Minimize2Icon, XIcon } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import {
  DOCK_PANEL_HEADER_HEIGHT_CLASS,
  DOCK_PANEL_ICON_BUTTON_CLASS,
} from '~/widgets/dock-panel'

export function MapToolPanelHeader({
  title,
  variantLabel,
  onClose,
  onMinimize,
  dragHandleProps,
  reserveDragSlot = false,
  isDragging = false,
  className,
}: {
  title: string
  variantLabel?: string | null
  onClose: () => void
  onMinimize?: () => void
  dragHandleProps?: ComponentPropsWithoutRef<'button'>
  reserveDragSlot?: boolean
  isDragging?: boolean
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
            title="拖动面板（靠近边缘/中线自动对齐）"
            className={cn(
              DOCK_PANEL_ICON_BUTTON_CLASS,
              'cursor-grab touch-none active:cursor-grabbing',
              isDragging && 'cursor-grabbing',
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
      {onMinimize ? (
        <button
          type="button"
          aria-label={`收起${title}`}
          title={`收起${title}`}
          onClick={onMinimize}
          className={DOCK_PANEL_ICON_BUTTON_CLASS}
        >
          <Minimize2Icon className="size-3.5" />
        </button>
      ) : null}
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

/**
 * 地图工具浮层唯一滚动层。
 * 外壳 `mapToolPanelShellClass` 限高 + overflow-hidden；内容区 `min-h-0 flex-1` 承接滚动。
 * 各 Mock 工具内容禁止根级 `overflow-y-auto`（见 tool-content-scroll-policy.test.ts）。
 */
export function MapToolPanelBody({ children }: { children: ReactNode }) {
  return (
    <div className="map-tool-panel-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
      {children}
    </div>
  )
}

/** 地图工具浮层外壳：复用 cc-glass-panel 浅/深主题（见 home.css） */
export function mapToolPanelShellClass(options: {
  presentation: 'movable-panel' | 'anchor'
}): string {
  return cn(
    'cc-glass-panel text-foreground flex min-h-0 max-h-[min(420px,50vh)] shrink-0 flex-col overflow-hidden rounded-lg backdrop-blur-sm',
    options.presentation === 'movable-panel' && 'border-primary/30',
  )
}
