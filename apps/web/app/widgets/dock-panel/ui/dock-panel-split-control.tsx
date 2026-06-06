import { cn } from '@repo/ui'
import { ChevronRightIcon, PanelLeftCloseIcon, type LucideIcon } from 'lucide-react'

/** Dock 面板右缘「收起」手柄 */
export function DockPanelCollapseHandle({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn('workspace-dock-collapse-handle absolute top-1/2 -translate-y-1/2', className)}
    >
      <PanelLeftCloseIcon className="size-3.5 text-current" strokeWidth={2.25} />
    </button>
  )
}

/** 地图左缘「展开 Dock」标签（收起后显示模块图标） */
export function DockPanelExpandEdge({
  label,
  shortLabel,
  icon: Icon,
  onClick,
  className,
  railClassName,
  stackIndex = 0,
}: {
  label: string
  shortLabel?: string
  icon?: LucideIcon
  onClick: () => void
  className?: string
  railClassName?: string
  /** 多个 Dock 同时收起时水平错开，避免图标叠在一起 */
  stackIndex?: number
}) {
  return (
    <>
      <div aria-hidden className={cn('workspace-dock-edge-rail', railClassName)} />
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={onClick}
        className={cn(
          'workspace-dock-edge-tab absolute top-1/2 -translate-y-1/2',
          className,
        )}
        style={stackIndex > 0 ? { left: `${stackIndex * 2.75}rem` } : undefined}
      >
        {Icon ? (
          <Icon
            className="size-4 shrink-0 text-brand-deep dark:text-brand-light/90"
            strokeWidth={2}
            aria-hidden
          />
        ) : null}
        {shortLabel ? (
          <span className="text-[10px] leading-none font-medium text-muted-foreground dark:text-white/75">
            {shortLabel}
          </span>
        ) : null}
        <ChevronRightIcon
          className="size-3 shrink-0 text-muted-foreground/75 dark:text-white/45"
          strokeWidth={2.25}
          aria-hidden
        />
      </button>
    </>
  )
}
