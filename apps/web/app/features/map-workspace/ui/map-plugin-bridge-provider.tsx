import { type ReactNode, useEffect, useMemo } from 'react'

import { createDefaultMapPluginBridgeOptions } from '../lib/create-default-map-plugin-bridge-options'
import {
  createRegistryMapPluginBridge,
  type RegistryMapPluginBridgeOptions,
} from '../lib/create-registry-map-plugin-bridge'
import { isMapPluginBridgeAttached, setMapPluginBridge } from '../lib/map-plugin-bridge'

export interface MapPluginBridgeProviderProps {
  /** MapProvider 就绪后传入 packages-map lazy loaders（覆盖默认） */
  bridgeOptions?: RegistryMapPluginBridgeOptions
  children?: ReactNode
}

/**
 * Phase C 宿主侧 bridge 注入点。默认 `createDefaultMapPluginBridgeOptions()`；
 * packages-map 联调时设 `VITE_MAP_PLUGIN_LOADERS=true`。
 */
export function MapPluginBridgeProvider({
  bridgeOptions,
  children,
}: MapPluginBridgeProviderProps) {
  const resolvedOptions = useMemo(
    () => bridgeOptions ?? createDefaultMapPluginBridgeOptions(),
    [bridgeOptions],
  )

  useEffect(() => {
    if (isMapPluginBridgeAttached()) {
      return
    }
    setMapPluginBridge(createRegistryMapPluginBridge(resolvedOptions))
  }, [resolvedOptions])

  return children ?? null
}
