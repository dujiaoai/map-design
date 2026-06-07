import { cn, Sheet, SheetContent, useIsMobile } from '@repo/ui'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useShallow } from 'zustand/react/shallow'

import {
  resolveActiveSidebarModule,
  resolveNativeSidebarModule,
  resolveSidebarModuleSurfaceKey,
  type ActiveSidebarModule,
} from '~/features/map-workspace/lib/resolve-active-sidebar-module'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import { MapBusinessDock } from '~/widgets/map-business-dock'
import { MapDockPanel } from '~/widgets/map-dock-panel'
import {
  DockPanelCollapseHandle,
  DockPanelHeader,
} from '~/widgets/dock-panel'

import { useContextPanelSurface } from '../lib/use-context-panel-surface'
import {
  WORKSPACE_CONTEXT_PANEL_MS,
  useWorkspaceContextPanelTransition,
} from '../lib/use-workspace-context-panel-transition'
import { useWorkspaceModuleContentMotion } from '../lib/use-workspace-module-content-motion'

function ContextPanelBody({
  activeModule,
  motionKey,
  motionDirection,
  motionSwap,
}: {
  activeModule: ActiveSidebarModule
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
      {activeModule.kind === 'uav' ? (
        <MapDockPanel embedded />
      ) : (
        <MapBusinessDock embedded />
      )}
    </div>
  )
}

function ContextPanelShell({
  fullscreen,
  onExitFullscreen,
  onCollapse,
  collapseLabel,
  headerTitle,
  onCloseModule,
  onToggleFullscreen,
  children,
  className,
}: {
  fullscreen: boolean
  onExitFullscreen: () => void
  onCollapse: () => void
  collapseLabel: string
  headerTitle: string
  onCloseModule: () => void
  onToggleFullscreen: () => void
  children: ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!fullscreen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onExitFullscreen()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [fullscreen, onExitFullscreen])

  return (
    <div
      className={cn(
        'workspace-context-panel border-border relative flex h-full min-h-0 flex-col dark:border-white/8',
        fullscreen
          ? 'fixed inset-0 z-[200] h-svh w-screen max-w-none border-0 bg-background shadow-none'
          : 'border-r',
        className,
      )}
    >
      <DockPanelHeader
        title={headerTitle}
        fullscreen={fullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onClose={onCloseModule}
      />
      {children}
      {!fullscreen ? (
        <DockPanelCollapseHandle
          label={collapseLabel}
          className="-right-3.5"
          onClick={onCollapse}
        />
      ) : null}
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
        showCloseButton={false}
        className="workspace-context-sheet cc-sheet-menu flex w-[min(360px,92vw)] max-w-[92vw] flex-col gap-0 overflow-hidden rounded-r-xl p-0 sm:max-w-md"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

function selectSidebarModuleState(state: ReturnType<typeof useMapWorkspaceStore.getState>) {
  return {
    activeDockModuleId: state.activeDockModuleId,
    dockPanelCollapsed: state.dockPanelCollapsed,
    activeModuleId: state.activeModuleId,
    modulePanelCollapsed: state.modulePanelCollapsed,
  }
}

/**
 * 地图左侧统一上下文面板；侧栏模块全局互斥，任意时刻仅展示一个模块
 */
export function MapContextPanel() {
  const isMobile = useIsMobile()
  const sidebarModuleState = useMapWorkspaceStore(useShallow(selectSidebarModuleState))
  const setDockPanelCollapsed = useMapWorkspaceStore((state) => state.setDockPanelCollapsed)
  const setModulePanelCollapsed = useMapWorkspaceStore((state) => state.setModulePanelCollapsed)
  const setContextPanelPresent = useMapWorkspaceStore((state) => state.setContextPanelPresent)

  const activeModule = resolveActiveSidebarModule(sidebarModuleState)
  const nativeModule = resolveNativeSidebarModule(sidebarModuleState)
  const handoffToNative = nativeModule !== null && activeModule === null
  const lastModuleRef = useRef(activeModule)
  if (activeModule) {
    lastModuleRef.current = activeModule
  }
  const displayModule = activeModule ?? (handoffToNative ? null : lastModuleRef.current)
  const isOpen = activeModule !== null

  const { mounted, open, exiting, phase } = useWorkspaceContextPanelTransition(isOpen, {
    immediateClose: handoffToNative,
  })

  useEffect(() => {
    setContextPanelPresent(mounted)
    return () => setContextPanelPresent(false)
  }, [mounted, setContextPanelPresent])

  const surfaceKey = resolveSidebarModuleSurfaceKey(displayModule)
  const { motionKey, direction, isSwap } = useWorkspaceModuleContentMotion(surfaceKey, open)

  const activeSurface = useContextPanelSurface()

  function collapsePanel() {
    const module = activeModule ?? lastModuleRef.current
    if (!module) return
    if (module.kind === 'uav') {
      setDockPanelCollapsed(true)
    } else {
      setModulePanelCollapsed(true)
    }
  }

  if (!mounted || !displayModule) {
    return null
  }

  const headerTitle = activeSurface?.title ?? '模块面板'

  const panelBody = (
    <ContextPanelBody
      activeModule={displayModule}
      motionKey={motionKey}
      motionDirection={direction}
      motionSwap={isSwap}
    />
  )

  const panelShell = (
    <ContextPanelShell
      fullscreen={activeSurface?.fullscreen ?? false}
      onExitFullscreen={() => {
        if (activeSurface?.fullscreen) {
          activeSurface.toggleFullscreen()
        }
      }}
      onCollapse={collapsePanel}
      collapseLabel={`收起${headerTitle}`}
      headerTitle={headerTitle}
      onCloseModule={() => {
        activeSurface?.closeModule()
      }}
      onToggleFullscreen={() => {
        activeSurface?.toggleFullscreen()
      }}
      className={exiting ? 'pointer-events-none' : undefined}
    >
      {panelBody}
    </ContextPanelShell>
  )

  if (isMobile) {
    return (
      <MapContextPanelSheet open={isOpen} onClose={collapsePanel}>
        {panelShell}
      </MapContextPanelSheet>
    )
  }

  const desktopPanel =
    activeSurface?.fullscreen && typeof document !== 'undefined'
      ? createPortal(panelShell, document.body)
      : panelShell

  return (
    <div
      data-phase={phase}
      data-state={exiting ? 'closed' : 'open'}
      className={cn(
        'workspace-context-panel-shell shrink-0',
        open && 'workspace-context-panel-shell--open',
        exiting && 'workspace-context-panel-shell--exit',
        activeSurface?.fullscreen && 'workspace-context-panel-shell--fullscreen',
      )}
      style={{ '--ws-panel-ms': `${WORKSPACE_CONTEXT_PANEL_MS}ms` } as CSSProperties}
      inert={exiting ? true : undefined}
    >
      {desktopPanel}
    </div>
  )
}
