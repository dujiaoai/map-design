import { cn } from '@haoxuan/ui'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { mockModuleMeta } from '~/entities/navigation'
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

/** 地图画布左侧固定业务 Dock（展开时占位列，非浮层） */
export function MapBusinessDock() {
  const activeModuleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const setModulePanelCollapsed = useMapWorkspaceStore((state) => state.setModulePanelCollapsed)
  const closeMapModule = useMapWorkspaceStore((state) => state.closeMapModule)
  const fullscreen = useMapWorkspaceStore((state) => state.modulePanelFullscreen)
  const toggleModulePanelFullscreen = useMapWorkspaceStore((state) => state.toggleModulePanelFullscreen)

  if (!activeModuleId || collapsed) {
    return null
  }

  const meta = mockModuleMeta[activeModuleId]
  if (!meta) {
    return null
  }

  return (
    <DockPanelFrame
      title={meta.title}
      fullscreen={fullscreen}
      onToggleFullscreen={() => toggleModulePanelFullscreen()}
      onClose={() => closeMapModule()}
      onExitFullscreen={() => {
        if (fullscreen) toggleModulePanelFullscreen()
      }}
      footer={
        !fullscreen ? (
          <DockSplitControl
            direction="collapse"
            label={`收起${meta.title}`}
            className="-right-3"
            onClick={() => setModulePanelCollapsed(true)}
          />
        ) : null
      }
    >
      <div className="text-muted-foreground flex-1 overflow-y-auto p-4 text-sm">
        业务模块占位：{meta.title}（moduleId: {activeModuleId}）
      </div>
    </DockPanelFrame>
  )
}

/**
 * 业务 Dock 收起后，地图左缘分割条展开控件（辅助入口，不占列宽）
 * 主入口：侧栏同一菜单项再次点击
 */
export function MapBusinessDockEdge() {
  const activeModuleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const dockCollapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const setModulePanelCollapsed = useMapWorkspaceStore((state) => state.setModulePanelCollapsed)

  if (!activeModuleId || !collapsed) {
    return null
  }

  const meta = mockModuleMeta[activeModuleId]
  if (!meta) {
    return null
  }

  const dockEdgeVisible = Boolean(activeDockModuleId && dockCollapsed)

  return (
    <>
      <div
        aria-hidden
        className={cn(
          'bg-border/40 hover:bg-border/70 absolute top-0 z-10 h-full w-1 transition-colors',
          dockEdgeVisible ? 'left-8' : 'left-0',
        )}
      />
      <DockSplitControl
        direction="expand"
        label={`展开${meta.title}`}
        className={cn(dockEdgeVisible ? 'left-8 -translate-x-1/2' : 'left-0 -translate-x-1/2')}
        onClick={() => setModulePanelCollapsed(false)}
      />
    </>
  )
}
