import { cn, Sheet, SheetContent, useIsMobile } from '@repo/ui'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

import { mockDockModuleMeta, mockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import { MapBusinessDock } from '~/widgets/map-business-dock'
import { MapDockPanel } from '~/widgets/map-dock-panel'

import {
  WORKSPACE_CONTEXT_PANEL_MS,
  useWorkspaceContextPanelTransition,
} from '../lib/use-workspace-context-panel-transition'
import { useWorkspaceModuleContentMotion } from '../lib/use-workspace-module-content-motion'
import {
  resolveVisibleModuleSurfaceKey,
  type ContextTab,
} from '../lib/workspace-module-surface'

function ContextPanelTabs({
  tab,
  showTabs,
  dataTitle,
  workspaceTitle,
  onTabChange,
}: {
  tab: ContextTab
  showTabs: boolean
  dataTitle?: string
  workspaceTitle?: string
  onTabChange: (tab: ContextTab) => void
}) {
  if (!showTabs) return null

  return (
    <div
      className="workspace-context-tabs border-border flex shrink-0 border-b bg-muted/35 dark:bg-black/10"
      role="tablist"
      aria-label="上下文面板"
    >
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'data'}
        className={cn(
          'flex-1 px-3 py-2 text-xs transition-colors',
          tab === 'data'
            ? 'border-primary text-brand-deep dark:text-brand-light border-b-2 bg-primary/10'
            : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => onTabChange('data')}
      >
        {dataTitle ?? '数据'}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === 'workspace'}
        className={cn(
          'flex-1 px-3 py-2 text-xs transition-colors',
          tab === 'workspace'
            ? 'border-primary text-brand-deep dark:text-brand-light border-b-2 bg-primary/10'
            : 'text-muted-foreground hover:text-foreground',
        )}
        onClick={() => onTabChange('workspace')}
      >
        {workspaceTitle ?? '模块'}
      </button>
    </div>
  )
}

function ContextPanelBody({
  tab,
  showTabs,
  dataTitle,
  workspaceTitle,
  workspaceIsUav,
  onTabChange,
  motionKey,
  motionDirection,
  motionSwap,
}: {
  tab: ContextTab
  showTabs: boolean
  dataTitle?: string
  workspaceTitle?: string
  workspaceIsUav: boolean
  onTabChange: (tab: ContextTab) => void
  motionKey: string
  motionDirection: 'forward' | 'back'
  motionSwap: boolean
}) {
  return (
    <div
      key={motionKey}
      className={cn(
        'workspace-module-surface flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
        motionSwap &&
          (motionDirection === 'forward'
            ? 'workspace-module-surface--enter-forward'
            : 'workspace-module-surface--enter-back'),
      )}
    >
      <ContextPanelTabs
        tab={tab}
        showTabs={showTabs}
        dataTitle={dataTitle}
        workspaceTitle={workspaceTitle}
        onTabChange={onTabChange}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <MapBusinessDock slot="data" hidden={!showTabs ? false : tab !== 'data'} />
        {workspaceIsUav ? (
          <MapDockPanel hidden={showTabs && tab !== 'workspace'} />
        ) : (
          <MapBusinessDock slot="workspace" hidden={showTabs && tab !== 'workspace'} />
        )}
      </div>
    </div>
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
        className="workspace-context-sheet cc-sheet-menu flex w-[min(360px,92vw)] max-w-[92vw] flex-col gap-0 p-0 sm:max-w-md"
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
  const activeDataModuleId = useMapWorkspaceStore((state) => state.activeDataModuleId)
  const dataCollapsed = useMapWorkspaceStore((state) => state.dataModulePanelCollapsed)
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const dockCollapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const activeModuleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const moduleCollapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const setDataModulePanelCollapsed = useMapWorkspaceStore(
    (state) => state.setDataModulePanelCollapsed,
  )
  const setDockPanelCollapsed = useMapWorkspaceStore((state) => state.setDockPanelCollapsed)
  const setModulePanelCollapsed = useMapWorkspaceStore((state) => state.setModulePanelCollapsed)
  const setContextPanelPresent = useMapWorkspaceStore((state) => state.setContextPanelPresent)

  const dataOpen = Boolean(activeDataModuleId && !dataCollapsed)
  const workspaceIsUav = Boolean(activeDockModuleId)
  const workspaceOpen = Boolean(
    (activeDockModuleId && !dockCollapsed) || (activeModuleId && !moduleCollapsed),
  )
  const isOpen = dataOpen || workspaceOpen
  const showTabs = dataOpen && workspaceOpen

  const dataTitle = activeDataModuleId ? mockModuleMeta[activeDataModuleId]?.title : undefined
  const workspaceTitle = workspaceIsUav
    ? activeDockModuleId
      ? mockDockModuleMeta[activeDockModuleId]?.title
      : undefined
    : activeModuleId
      ? mockModuleMeta[activeModuleId]?.title
      : undefined

  const [tab, setTab] = useState<ContextTab>('data')

  useEffect(() => {
    if (dataOpen) {
      setTab('data')
    } else if (workspaceOpen) {
      setTab('workspace')
    }
  }, [dataOpen, workspaceOpen, activeDataModuleId, activeDockModuleId, activeModuleId])

  const { mounted, open, exiting, phase } = useWorkspaceContextPanelTransition(isOpen)

  useEffect(() => {
    setContextPanelPresent(mounted)
    return () => setContextPanelPresent(false)
  }, [mounted, setContextPanelPresent])

  const surfaceKey = resolveVisibleModuleSurfaceKey({
    tab,
    showTabs,
    activeDataModuleId,
    activeDockModuleId,
    activeModuleId,
    dataOpen,
    workspaceOpen,
    workspaceIsUav,
  })
  const { motionKey, direction, isSwap } = useWorkspaceModuleContentMotion(surfaceKey, open)

  function closePanel() {
    if (dataOpen) {
      setDataModulePanelCollapsed(true)
    }
    if (workspaceOpen) {
      if (workspaceIsUav) {
        setDockPanelCollapsed(true)
      } else {
        setModulePanelCollapsed(true)
      }
    }
  }

  if (!mounted) {
    return null
  }

  const body = (
    <ContextPanelBody
      tab={tab}
      showTabs={showTabs}
      dataTitle={dataTitle}
      workspaceTitle={workspaceTitle}
      workspaceIsUav={workspaceIsUav}
      onTabChange={setTab}
      motionKey={motionKey}
      motionDirection={direction}
      motionSwap={isSwap}
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
    <div
      data-phase={phase}
      data-state={exiting ? 'closed' : 'open'}
      className={cn(
        'workspace-context-panel-shell shrink-0',
        open && 'workspace-context-panel-shell--open',
        exiting && 'workspace-context-panel-shell--exit',
      )}
      style={{ '--ws-panel-ms': `${WORKSPACE_CONTEXT_PANEL_MS}ms` } as CSSProperties}
      inert={exiting ? true : undefined}
    >
      <div
        className={cn(
          'workspace-context-panel border-border relative flex h-full min-h-0 flex-col border-r dark:border-white/8',
          exiting && 'pointer-events-none',
        )}
      >
        {body}
      </div>
    </div>
  )
}
