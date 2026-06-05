import { useMapWorkspaceUrlSync } from '../lib/use-map-workspace-url-sync'

/** 挂载于地图工作台页面，同步 store 与 URL query */
export function MapWorkspaceUrlSync() {
  useMapWorkspaceUrlSync()
  return null
}
