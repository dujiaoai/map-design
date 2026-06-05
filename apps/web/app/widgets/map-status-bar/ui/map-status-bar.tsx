import { Button, cn } from '@repo/ui'
import { CrosshairIcon, LayersIcon, LogOutIcon, RulerIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { mockNavMainItems, resolveNavToolMeta } from '~/entities/navigation'
import { resolveWorkspaceContext, useMapWorkspaceStore } from '~/features/map-workspace'

/** 底栏高度，供地图浮层避让 */
export const MAP_STATUS_BAR_HEIGHT_CLASS = 'h-9'

const MOCK_VIEWPORT = {
  scale: '1:5,000',
  zoom: 14,
} as const

function useLiveCoords() {
  const [coords, setCoords] = useState({ lng: 116.391234, lat: 39.907128 })

  useEffect(() => {
    const tick = window.setInterval(() => {
      setCoords({
        lng: 116.38 + Math.random() * 0.02,
        lat: 39.9 + Math.random() * 0.015,
      })
    }, 2800)

    return () => window.clearInterval(tick)
  }, [])

  return coords
}

export function MapStatusBar({ className }: { className?: string }) {
  const statusSummary = useMapWorkspaceStore((state) => resolveWorkspaceContext(state).statusSummary)
  const activeMapTool = useMapWorkspaceStore((state) => state.activeMapTool)
  const clearMapTool = useMapWorkspaceStore((state) => state.clearMapTool)
  const coords = useLiveCoords()

  const activeToolTitle = activeMapTool
    ? (resolveNavToolMeta(mockNavMainItems, activeMapTool.navItemId)?.title ?? activeMapTool.toolId)
    : null

  return (
    <footer
      className={cn(
        'workspace-status-bar cc-mono text-muted-foreground flex shrink-0 items-center gap-2 px-2 text-[11px] sm:gap-3 sm:px-3 dark:text-white/55',
        MAP_STATUS_BAR_HEIGHT_CLASS,
        className,
      )}
      aria-label="地图状态栏"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <CrosshairIcon className="size-3.5 shrink-0 text-brand-light/70" aria-hidden />
        <span className="workspace-status-label hidden sm:inline">Coords</span>
        <span className="truncate tabular-nums text-foreground/85 dark:text-white/80">
          {coords.lng.toFixed(6)}, {coords.lat.toFixed(6)}
        </span>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <span className="flex items-center gap-1.5 tabular-nums">
          <RulerIcon className="size-3.5 shrink-0 text-brand-light/70" aria-hidden />
          {MOCK_VIEWPORT.scale}
        </span>
        <span className="flex items-center gap-1.5 tabular-nums">
          <LayersIcon className="size-3.5 shrink-0 text-brand-light/70" aria-hidden />
          Z{MOCK_VIEWPORT.zoom}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        {activeToolTitle ? (
          <>
            <span className="workspace-tool-chip hidden truncate rounded-md px-2 py-0.5 text-[10px] sm:inline">
              工具 · {activeToolTitle}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-[10px] text-brand-deep hover:bg-accent hover:text-foreground dark:text-brand-soft dark:hover:bg-white/8 dark:hover:text-white"
              aria-label={`退出${activeToolTitle}`}
              onClick={() => clearMapTool()}
            >
              <LogOutIcon className="size-3" />
              <span className="hidden sm:inline">退出工具</span>
            </Button>
          </>
        ) : (
          <span
            className={cn(
              'min-w-0 truncate rounded-md px-2 py-0.5 text-right text-[10px]',
              statusSummary ? 'workspace-tool-chip' : 'text-muted-foreground dark:text-white/40',
            )}
          >
            {statusSummary ?? '就绪'}
          </span>
        )}
      </div>
    </footer>
  )
}
