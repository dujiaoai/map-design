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
      <PanelLeftCloseIcon className="size-3.5" strokeWidth={2.25} />
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
}: {
  label: string
  shortLabel?: string
  icon?: LucideIcon
  onClick: () => void
  className?: string
  railClassName?: string
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
      >
        {Icon ? <Icon className="text-brand-light/90 size-3.5 shrink-0" strokeWidth={2} /> : null}
        {shortLabel ? (
          <span className="text-[10px] leading-none font-medium text-white/75">{shortLabel}</span>
        ) : null}
        <ChevronRightIcon className="size-3 shrink-0 text-white/45" strokeWidth={2.25} />
      </button>
    </>
  )
}
