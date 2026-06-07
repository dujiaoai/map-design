import { cn } from '@repo/ui'
import { useShallow } from 'zustand/react/shallow'

import { MockModuleContent } from '~/entities/mock-workspace-content'
import { mockModuleMeta } from '~/entities/navigation'
import {
  resolveNativeSidebarModule,
} from '~/features/map-workspace/lib/resolve-active-sidebar-module'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import { DockPanelHeader, DockPanelScrollBody } from '~/widgets/dock-panel'

function selectSidebarModuleState(state: ReturnType<typeof useMapWorkspaceStore.getState>) {
  return {
    activeDockModuleId: state.activeDockModuleId,
    dockPanelCollapsed: state.dockPanelCollapsed,
    activeModuleId: state.activeModuleId,
    modulePanelCollapsed: state.modulePanelCollapsed,
  }
}

/**
 * display 类侧栏模块载体（单层壳，与左列互斥）
 */
export function MapNativeModuleHost() {
  const sidebarState = useMapWorkspaceStore(useShallow(selectSidebarModuleState))
  const closeMapModule = useMapWorkspaceStore((state) => state.closeMapModule)

  const nativeModule = resolveNativeSidebarModule(sidebarState)
  if (!nativeModule) {
    return null
  }

  const meta = mockModuleMeta[nativeModule.moduleId]
  if (!meta) {
    return null
  }

  const isModifyPanel = meta.pluginType === 'modify-panel'

  return (
    <aside
      className={cn(
        'workspace-native-module-host border-border cc-glass-panel pointer-events-auto absolute z-20 flex flex-col overflow-hidden border shadow-lg',
        isModifyPanel
          ? 'top-2 right-2 bottom-2 w-[min(420px,92vw)] rounded-l-xl'
          : 'right-4 bottom-4 w-[min(320px,88vw)] max-h-[min(420px,50vh)] min-h-0 rounded-xl',
      )}
    >
      <DockPanelHeader
        title={meta.title}
        onClose={() => closeMapModule()}
      />
      <DockPanelScrollBody>
        <MockModuleContent moduleId={nativeModule.moduleId} title={meta.title} />
      </DockPanelScrollBody>
    </aside>
  )
}
