import { Button, cn } from '@repo/ui'
import { LogOutIcon } from 'lucide-react'

import { mockNavMainItems, resolveNavToolMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'

export function MapToolActionBar() {
  const activeMapTool = useMapWorkspaceStore((state) => state.activeMapTool)
  const clearMapTool = useMapWorkspaceStore((state) => state.clearMapTool)

  if (!activeMapTool) {
    return null
  }

  const meta = resolveNavToolMeta(mockNavMainItems, activeMapTool.navItemId)
  const title = meta?.title ?? activeMapTool.toolId

  return (
    <div
      className={cn(
        'bg-background/95 pointer-events-auto absolute right-3 bottom-3 z-30',
        'flex items-center gap-2 rounded-lg border px-2 py-1.5 shadow-lg backdrop-blur-sm',
      )}
      role="toolbar"
      aria-label="地图工具操作条"
    >
      <span className="text-muted-foreground max-w-[140px] truncate px-1 text-xs">
        使用中：{title}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-8 gap-1"
        aria-label={`退出${title}`}
        onClick={() => clearMapTool()}
      >
        <LogOutIcon className="size-3.5" />
        退出
      </Button>
    </div>
  )
}
