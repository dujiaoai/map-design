import { AppProvider } from '@/app/providers/AppProvider'
import { DockDashboardPage } from '@/pages/dock-dashboard/ui/DockDashboardPage'
import { CLOUD_PLUGIN_UAV_BASE } from '@/shared/config/module-manifest'
import { createCloudPluginModule } from '@/shared/lib/create-module-runtime'

export function App() {
  return (
    <AppProvider>
      <DockDashboardPage />
    </AppProvider>
  )
}

const runtime = createCloudPluginModule(App, {
  devReloadSpecifier: `${CLOUD_PLUGIN_UAV_BASE}src/modules/dock-dashboard/index.tsx`,
})

export const mount = runtime.mount
export const unmount = runtime.unmount
export const reload = runtime.reload
export const version = runtime.version
