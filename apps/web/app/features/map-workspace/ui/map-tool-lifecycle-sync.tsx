import { useEffect } from 'react'

import { createDevMapPluginBridge, getMapPluginBridge, setMapPluginBridge } from '../lib/map-plugin-bridge'
import { useMapWorkspaceStore } from '../model/workspace-store'

/** 将 activeMapTool / activeDrawerTool 同步到 map-plugins bridge */
export function MapToolLifecycleSync() {
  useEffect(() => {
    setMapPluginBridge(createDevMapPluginBridge())
  }, [])
  const activeMapTool = useMapWorkspaceStore((state) => state.activeMapTool)
  const activeDrawerTool = useMapWorkspaceStore((state) => state.activeDrawerTool)

  useEffect(() => {
    const bridge = getMapPluginBridge()
    if (activeMapTool) {
      bridge.startMapTool(activeMapTool)
    } else {
      bridge.stopMapTool()
    }
  }, [activeMapTool])

  useEffect(() => {
    const bridge = getMapPluginBridge()
    if (activeDrawerTool) {
      bridge.showDrawerTool(activeDrawerTool)
    } else {
      bridge.hideDrawerTool()
    }
  }, [activeDrawerTool])

  return null
}
