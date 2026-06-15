import { type ReactNode, useEffect } from 'react'

import {
  createRegistryMapPluginBridge,
  type RegistryMapPluginBridgeOptions,
} from '../lib/create-registry-map-plugin-bridge'
import { isMapPluginBridgeAttached, setMapPluginBridge } from '../lib/map-plugin-bridge'

export interface MapPluginBridgeProviderProps {
  /** MapProvider 就绪后传入 packages-map lazy loaders */
  bridgeOptions?: RegistryMapPluginBridgeOptions
  children?: ReactNode
}

/**
 * Phase C 宿主侧 bridge 注入点。MapProvider 挂载后传入 `bridgeOptions`，
 * 或由默认 registry bridge 占位（DEV console.debug）。
 */
export function MapPluginBridgeProvider({
  bridgeOptions,
  children,
}: MapPluginBridgeProviderProps) {
  useEffect(() => {
    if (isMapPluginBridgeAttached()) {
      return
    }
    setMapPluginBridge(createRegistryMapPluginBridge(bridgeOptions))
  }, [bridgeOptions])

  return children ?? null
}
