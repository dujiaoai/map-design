import type { RegistryMapPluginBridgeOptions } from './create-registry-map-plugin-bridge'
import {
  createMapPluginDrawerLoaders,
  createMapPluginToolLoaders,
  isMapPluginLoadersEnabled,
} from './map-plugin-tool-loaders'

/** MapPluginBridgeProvider 默认 bridgeOptions；packages-map 联调时设 VITE_MAP_PLUGIN_LOADERS=true */
export function createDefaultMapPluginBridgeOptions(): RegistryMapPluginBridgeOptions {
  if (!isMapPluginLoadersEnabled()) {
    return {}
  }
  return {
    toolLoaders: createMapPluginToolLoaders(),
    drawerLoaders: createMapPluginDrawerLoaders(),
  }
}
