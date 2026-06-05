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
        'cc-glass-panel pointer-events-auto absolute right-3 bottom-3 z-30',
        'flex items-center gap-2 rounded-lg px-2 py-1.5',
      )}
      role="toolbar"
      aria-label="地图工具操作条"
    >
      <span className="cc-mono max-w-[140px] truncate px-1 text-[11px] text-brand-soft">
        ACTIVE · {title}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-8 gap-1 border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
        aria-label={`退出${title}`}
        onClick={() => clearMapTool()}
      >
        <LogOutIcon className="size-3.5" />
        退出
      </Button>
    </div>
  )
}
