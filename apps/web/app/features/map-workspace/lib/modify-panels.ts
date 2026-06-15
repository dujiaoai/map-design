import { mockModuleMeta } from '~/entities/navigation/model/mock-nav-items'

import { useMapWorkspaceStore } from '../model/workspace-store'

export function isModifyPanelModule(moduleId: string): boolean {
  return mockModuleMeta[moduleId]?.pluginType === 'modify-panel'
}

export function listModifyPanelModuleIds(): string[] {
  return Object.entries(mockModuleMeta)
    .filter(([, meta]) => meta.pluginType === 'modify-panel')
    .map(([moduleId]) => moduleId)
}

export function resolveModuleIdByPluginToolId(pluginToolId: string): string | null {
  for (const [moduleId, meta] of Object.entries(mockModuleMeta)) {
    if (meta.pluginToolId === pluginToolId) {
      return moduleId
    }
  }
  return null
}

/**
 * 关闭除 `exceptModuleId` 外的其它 modify-panel 侧栏模块。
 * 对齐 HostCapabilities.modifyPanels.closeSiblingExcept（map-workspace-host-react）。
 */
export function closeSiblingModifyPanelsExcept(exceptModuleId: string | null): void {
  const state = useMapWorkspaceStore.getState()
  const { activeModuleId } = state
  if (!activeModuleId || activeModuleId === exceptModuleId) {
    return
  }
  if (!isModifyPanelModule(activeModuleId)) {
    return
  }
  state.closeMapModule()
}

export interface ModifyPanelsHost {
  closeSiblingExcept: (pluginToolId: string) => void
}

/** Phase C：供 MapProvider / bridge 注入的 modify-panel 互斥宿主 API */
export function createModifyPanelsHost(): ModifyPanelsHost {
  return {
    closeSiblingExcept(pluginToolId: string) {
      const moduleId = resolveModuleIdByPluginToolId(pluginToolId)
      closeSiblingModifyPanelsExcept(moduleId)
    },
  }
}
