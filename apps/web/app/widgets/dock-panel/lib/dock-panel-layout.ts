import { cn } from '@repo/ui'

/** 标题栏基准 h-8(2rem)，加高 20% → 2.4rem */
export const DOCK_PANEL_HEADER_HEIGHT_CLASS = 'h-[2.4rem]'

/** Dock / 地图工具面板标题栏 icon 按钮（统一 size-8） */
export const DOCK_PANEL_ICON_BUTTON_CLASS = cn(
  'text-muted-foreground hover:bg-muted hover:text-foreground',
  'flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
)

/** 全屏：固定铺满视口（Portal 到 body，覆盖侧栏 + 地图） */
export function dockPanelAsideClass(fullscreen: boolean) {
  return cn(
    'border-border bg-background flex flex-col',
    'transition-[width,opacity] duration-200',
    fullscreen
      ? 'fixed inset-0 z-[200] h-svh w-screen max-w-none border-0 shadow-none'
      : 'relative w-[360px] shrink-0 border-r',
  )
}
