import { cn } from '@repo/ui'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { mockDockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import { DockPanelFrame } from '~/widgets/dock-panel'

function DockSplitControl({
  direction,
  label,
  onClick,
  className,
}: {
  direction: 'collapse' | 'expand'
  label: string
  onClick: () => void
  className?: string
}) {
  const Icon = direction === 'collapse' ? ChevronLeftIcon : ChevronRightIcon

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
        'absolute top-1/2 z-20 flex size-6 -translate-y-1/2 items-center justify-center',
        'rounded-full border shadow-sm transition-colors',
        className,
      )}
    >
      <Icon className="size-3.5" />
    </button>
  )
}

/** 机库模块左侧固定 Dock（与地图业务 Dock 并列，互不挤占状态） */
export function MapDockPanel() {
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const setDockPanelCollapsed = useMapWorkspaceStore((state) => state.setDockPanelCollapsed)
  const closeMapDockModule = useMapWorkspaceStore((state) => state.closeMapDockModule)
  const fullscreen = useMapWorkspaceStore((state) => state.dockPanelFullscreen)
  const toggleDockPanelFullscreen = useMapWorkspaceStore((state) => state.toggleDockPanelFullscreen)

  if (!activeDockModuleId || collapsed) {
    return null
  }

  const meta = mockDockModuleMeta[activeDockModuleId]
  if (!meta) {
    return null
  }

  return (
    <DockPanelFrame
      title={meta.title}
      fullscreen={fullscreen}
      onToggleFullscreen={() => toggleDockPanelFullscreen()}
      onClose={() => closeMapDockModule()}
      onExitFullscreen={() => {
        if (fullscreen) toggleDockPanelFullscreen()
      }}
      footer={
        !fullscreen ? (
          <DockSplitControl
            direction="collapse"
            label={`收起${meta.title}`}
            className="-right-3"
            onClick={() => setDockPanelCollapsed(true)}
          />
        ) : null
      }
    >
      <div className="text-muted-foreground flex-1 overflow-y-auto p-4 text-sm">
        机库模块占位：{meta.title}（moduleId: {activeDockModuleId}）
      </div>
    </DockPanelFrame>
  )
}

/** 机库 Dock 收起后，地图左缘分割条展开控件 */
export function MapDockPanelEdge() {
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const setDockPanelCollapsed = useMapWorkspaceStore((state) => state.setDockPanelCollapsed)

  if (!activeDockModuleId || !collapsed) {
    return null
  }

  const meta = mockDockModuleMeta[activeDockModuleId]
  if (!meta) {
    return null
  }

  return (
    <>
      <div
        aria-hidden
        className="bg-border/40 hover:bg-border/70 absolute top-0 left-0 z-10 h-full w-1 transition-colors"
      />
      <DockSplitControl
        direction="expand"
        label={`展开${meta.title}`}
        className="left-0 -translate-x-1/2"
        onClick={() => setDockPanelCollapsed(false)}
      />
    </>
  )
}
