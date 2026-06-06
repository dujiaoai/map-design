import { SidebarInset, SidebarProvider, cn } from '@repo/ui'
import { type CSSProperties } from 'react'

import {
  MapToolLifecycleSync,
  MapWorkspaceKeyboardSync,
  MapWorkspaceUrlSync,
  useMapEngineReady,
  useMapWorkspaceStore,
} from '~/features/map-workspace'
import { AppSidebar } from '~/widgets/app-sidebar'
import { AccountSheet } from '~/widgets/account-sheet'
import { MapContextPanel } from '~/widgets/map-context-panel'
import { MapPlaceholder } from '~/widgets/map-canvas'
import { MapToolDrawerPanel } from '~/widgets/map-import-drawer'
import { MapBusinessDockEdge } from '~/widgets/map-business-dock'
import { MapDockPanelEdge } from '~/widgets/map-dock-panel'
import { MapQuickToolbar } from '~/widgets/map-quick-toolbar'
import { MapStatusBar } from '~/widgets/map-status-bar'
import { MockMapToolHost } from '~/widgets/map-tool-host'
import { MapWorkspaceHeader } from '~/widgets/map-workspace-header'
import { NotificationSheet } from '~/widgets/notification-sheet'
import { useWorkspaceChrome } from '~/widgets/workspace-chrome'
import { useWorkspacePointer, WorkspaceMapAtmosphere } from '~/widgets/workspace-shell'

import type { Route } from './+types/home'

import './home.css'

export function meta(_args: Route.MetaArgs) {
  return [
    { title: '云眼地图工作台' },
    { name: 'description', content: '下一代 GIS 协同平台' },
  ]
}

export function links(_args: Route.LinksArgs) {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' as const },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600;700&family=ZCOOL+QingKe+HuangYou&display=swap',
    },
  ]
}

export default function Home() {
  const pointer = useWorkspacePointer()
  const chrome = useWorkspaceChrome()
  const mapEngineReady = useMapEngineReady()
  const hasActiveTools = useMapWorkspaceStore(
    (state) =>
      Boolean(
        state.activeMapTool ||
          state.activeDrawerTool ||
          state.activePanelTools.length > 0,
      ),
  )

  const pointerStyle = {
    '--ws-px': pointer.x,
    '--ws-py': pointer.y,
  } as CSSProperties

  const canvasToneClass =
    mapEngineReady || hasActiveTools ? 'workspace-canvas--focused' : undefined

  return (
    <div className="workspace-page workspace-page-enter" style={pointerStyle}>
      <SidebarProvider>
        <MapWorkspaceUrlSync />
        <MapToolLifecycleSync />
        <MapWorkspaceKeyboardSync />
        <AppSidebar user={chrome.user} />
        <SidebarInset className="workspace-inset flex min-h-0 flex-1 flex-col overflow-hidden">
          <MapWorkspaceHeader
            className="workspace-reveal"
            style={{ '--stagger': 0 } as CSSProperties}
            user={chrome.user}
            notificationUnreadCount={chrome.notificationUnreadCount}
            onNotificationsClick={chrome.openNotifications}
            onAccountClick={chrome.openAccount}
            onLogout={() => void chrome.handleLogout()}
          />
          <div
            className="workspace-main workspace-reveal flex min-h-0 flex-1 overflow-hidden"
            style={{ '--stagger': 1 } as CSSProperties}
          >
            <MapContextPanel />
            <div
              className={cn(
                'workspace-canvas relative min-h-0 min-w-0 flex-1',
                canvasToneClass,
              )}
            >
              <WorkspaceMapAtmosphere subdued={mapEngineReady || hasActiveTools} />
              <MapPlaceholder />
              <MapQuickToolbar />
              <MockMapToolHost />
              <MapToolDrawerPanel />
              <MapDockPanelEdge />
              <MapBusinessDockEdge />
            </div>
          </div>
          <MapStatusBar
            className="workspace-reveal"
            style={{ '--stagger': 2 } as CSSProperties}
          />
        </SidebarInset>
      </SidebarProvider>

      <AccountSheet open={chrome.accountOpen} onOpenChange={chrome.setAccountOpen} />
      <NotificationSheet open={chrome.notificationOpen} onOpenChange={chrome.setNotificationOpen} />
    </div>
  )
}
