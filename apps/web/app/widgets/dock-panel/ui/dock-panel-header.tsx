import { cn } from '@repo/ui'
import { Maximize2Icon, Minimize2Icon, XIcon } from 'lucide-react'

import {
  DOCK_PANEL_HEADER_HEIGHT_CLASS,
  DOCK_PANEL_ICON_BUTTON_CLASS,
} from '../lib/dock-panel-layout'

/** 机库 / 业务 Dock 标题栏（高度为 h-8 的 120%） */
export function DockPanelHeader({
  title,
  fullscreen = false,
  onToggleFullscreen,
  onClose,
  className,
}: {
  title: string
  fullscreen?: boolean
  onToggleFullscreen?: () => void
  onClose: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border flex shrink-0 items-center gap-0.5 border-b px-1.5',
        DOCK_PANEL_HEADER_HEIGHT_CLASS,
        className,
      )}
    >
      <h2 className="min-w-0 flex-1 truncate px-1 text-sm font-medium">{title}</h2>
      {onToggleFullscreen ? (
        <button
          type="button"
          aria-label={fullscreen ? `退出${title}全屏` : `${title}全屏`}
          title={fullscreen ? '退出全屏' : '全屏'}
          onClick={onToggleFullscreen}
          className={DOCK_PANEL_ICON_BUTTON_CLASS}
        >
          {fullscreen ? (
            <Minimize2Icon className="size-3.5" />
          ) : (
            <Maximize2Icon className="size-3.5" />
          )}
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
