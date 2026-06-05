import { SidebarInset, SidebarProvider, SidebarTrigger } from '@repo/ui'

import { MapToolLifecycleSync, MapWorkspaceUrlSync } from '~/features/map-workspace'
import { AppSidebar } from '~/widgets/app-sidebar'
import { MapToolDrawerPanel } from '~/widgets/map-import-drawer'
import { MapBusinessDock, MapBusinessDockEdge } from '~/widgets/map-business-dock'
import { MapDockPanel, MapDockPanelEdge } from '~/widgets/map-dock-panel'
import { MapPlaceholder } from '~/widgets/map-canvas'
import { MapToolActionBar } from '~/widgets/map-tool-action-bar'
import { MockMapToolHost } from '~/widgets/map-tool-host'

import type { Route } from './+types/home'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '云瞰 · saas-web' }, { name: 'description', content: '地图工作台' }]
}

export default function Home() {
  return (
    <SidebarProvider>
      <MapWorkspaceUrlSync />
      <MapToolLifecycleSync />
      <AppSidebar />
      <SidebarInset className="flex min-h-svh flex-row overflow-hidden">
        <div className="relative flex min-w-0 flex-1">
          <MapDockPanel />
          <MapBusinessDock />
          <div className="relative min-w-0 flex-1">
          <MapPlaceholder />
          <MockMapToolHost />
          <MapToolActionBar />
          <MapToolDrawerPanel />
          <MapDockPanelEdge />
          <MapBusinessDockEdge />
          <div className="absolute left-3 top-3 z-10">
            <SidebarTrigger className="bg-background/90 shadow-sm backdrop-blur-sm" />
          </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
