import { mockModuleMeta } from '../model/mock-nav-items'

/**
 * 是否由左侧 MapContextPanel 承载。
 * 与运营段一致：display → 地图原生载体；其余 → 左列。
 */
export function usesLeftContextPanel(moduleId: string): boolean {
  const meta = mockModuleMeta[moduleId]
  if (!meta) {
    return true
  }
  return meta.pluginType !== 'display'
}
