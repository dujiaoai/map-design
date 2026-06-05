import { cn, Sheet, SheetContent, useIsMobile } from '@repo/ui'
import { useEffect, useState, type ReactNode } from 'react'

import { mockDockModuleMeta, mockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import { MapBusinessDock } from '~/widgets/map-business-dock'
import { MapDockPanel } from '~/widgets/map-dock-panel'

type ContextTab = 'module' | 'uav'

function ContextPanelTabs({
  tab,
  showTabs,
  moduleTitle,
  uavTitle,
  onTabChange,
}: {
  tab: ContextTab
  showTabs: boolean
  moduleTitle?: string
  uavTitle?: string
  onTabChange: (tab: ContextTab) => void
}) {
  if (!showTabs) return null

  return (
    <div
      className="border-border flex shrink-0 border-b bg-black/10"
      role="tablist"
      aria-label="上下文面板"
    >
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'module'}
        className={cn(
          'flex-1 px-3 py-2 text-xs transition-colors',
          tab === 'module'
            ? 'border-primary text-brand-light border-b-2 bg-primary/10'
            : 'text-white/50 hover:text-white/75',
        )}
        onClick={() => onTabChange('module')}
      >
        {moduleTitle ?? '业务'}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'uav'}
        className={cn(
          'flex-1 px-3 py-2 text-xs transition-colors',
          tab === 'uav'
            ? 'border-primary text-brand-light border-b-2 bg-primary/10'
            : 'text-white/50 hover:text-white/75',
        )}
        onClick={() => onTabChange('uav')}
      >
        {uavTitle ?? '机库'}
      </button>
    </div>
  )
}

function ContextPanelBody({
  tab,
  showTabs,
  moduleTitle,
  uavTitle,
  onTabChange,
}: {
  tab: ContextTab
  showTabs: boolean
  moduleTitle?: string
  uavTitle?: string
  onTabChange: (tab: ContextTab) => void
}) {
  return (
    <>
      <ContextPanelTabs
        tab={tab}
        showTabs={showTabs}
        moduleTitle={moduleTitle}
        uavTitle={uavTitle}
        onTabChange={onTabChange}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <MapBusinessDock hidden={showTabs && tab !== 'module'} />
        <MapDockPanel hidden={showTabs && tab !== 'uav'} />
      </div>
    </>
  )
}

function MapContextPanelSheet({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <SheetContent
        side="left"
        className="workspace-context-sheet flex w-[min(360px,92vw)] max-w-[92vw] flex-col gap-0 p-0 sm:max-w-md"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * 地图左侧统一上下文面板；移动端以 Sheet 从左侧滑出
 */
export function MapContextPanel() {
  const isMobile = useIsMobile()
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const dockCollapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const activeModuleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const moduleCollapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const setDockPanelCollapsed = useMapWorkspaceStore((state) => state.setDockPanelCollapsed)
  const setModulePanelCollapsed = useMapWorkspaceStore((state) => state.setModulePanelCollapsed)

  const uavOpen = Boolean(activeDockModuleId && !dockCollapsed)
  const moduleOpen = Boolean(activeModuleId && !moduleCollapsed)
  const isOpen = uavOpen || moduleOpen
  const showTabs = uavOpen && moduleOpen

  const moduleTitle = activeModuleId ? mockModuleMeta[activeModuleId]?.title : undefined
  const uavTitle = activeDockModuleId ? mockDockModuleMeta[activeDockModuleId]?.title : undefined

  const [tab, setTab] = useState<ContextTab>('module')

  useEffect(() => {
    if (moduleOpen) {
      setTab('module')
    } else if (uavOpen) {
      setTab('uav')
    }
  }, [moduleOpen, uavOpen, activeModuleId, activeDockModuleId])

  function closePanel() {
    if (moduleOpen) {
      setModulePanelCollapsed(true)
    }
    if (uavOpen) {
      setDockPanelCollapsed(true)
    }
  }

  if (!isOpen) {
    return null
  }

  const body = (
    <ContextPanelBody
      tab={tab}
      showTabs={showTabs}
      moduleTitle={moduleTitle}
      uavTitle={uavTitle}
      onTabChange={setTab}
    />
  )

  if (isMobile) {
    return (
      <MapContextPanelSheet open={isOpen} onClose={closePanel}>
        {body}
      </MapContextPanelSheet>
    )
  }

  return (
    <div className="workspace-context-panel flex min-h-0 w-[min(360px,38vw)] shrink-0 flex-col border-r border-white/8">
      {body}
    </div>
  )
}
