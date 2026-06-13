import { isKnownPluginToolIdInRegistry } from './map-plugin-registry'
import type { MapPluginBridge } from './map-plugin-bridge'
import type { ActiveDrawerTool, ActiveMapTool } from './workspace-url'

export type MapPluginRuntime = {
  stop?: () => void | Promise<void>
}

export type MapPluginToolLoader = (tool: ActiveMapTool) => Promise<MapPluginRuntime | void>

export type MapPluginDrawerLoader = (tool: ActiveDrawerTool) => Promise<MapPluginRuntime | void>

export interface RegistryMapPluginBridgeOptions {
  /** packages-map lazy entry；未注册时 DEV 下 console.debug */
  toolLoaders?: Partial<Record<string, MapPluginToolLoader>>
  drawerLoaders?: Partial<Record<string, MapPluginDrawerLoader>>
}

/**
 * Phase C bridge：按 registry 校验 pluginToolId，并支持注入 lazy loader。
 * MapProvider 就绪后可 `setMapPluginBridge(createRegistryMapPluginBridge({ toolLoaders }))`。
 */
export function createRegistryMapPluginBridge(
  options: RegistryMapPluginBridgeOptions = {},
): MapPluginBridge {
  let activeMapRuntime: MapPluginRuntime | null = null
  let activeDrawerRuntime: MapPluginRuntime | null = null

  async function stopActiveMapRuntime() {
    if (activeMapRuntime?.stop) {
      await activeMapRuntime.stop()
    }
    activeMapRuntime = null
  }

  async function stopActiveDrawerRuntime() {
    if (activeDrawerRuntime?.stop) {
      await activeDrawerRuntime.stop()
    }
    activeDrawerRuntime = null
  }

  return {
    startMapTool(tool) {
      void (async () => {
        await stopActiveMapRuntime()
        if (import.meta.env.DEV && !isKnownPluginToolIdInRegistry(tool.pluginToolId)) {
          console.warn('[map-plugin-bridge] unknown pluginToolId', tool.pluginToolId)
        }
        const loader = options.toolLoaders?.[tool.pluginToolId]
        if (loader) {
          const runtime = await loader(tool)
          if (runtime) activeMapRuntime = runtime
          return
        }
        if (import.meta.env.DEV) {
          console.debug('[map-plugin-bridge] start', tool.pluginToolId, tool.variant ?? {})
        }
      })()
    },
    stopMapTool() {
      void stopActiveMapRuntime()
      if (import.meta.env.DEV) {
        console.debug('[map-plugin-bridge] stop')
      }
    },
    showDrawerTool(tool) {
      void (async () => {
        await stopActiveDrawerRuntime()
        const loader = options.drawerLoaders?.[tool.pluginToolId]
        if (loader) {
          const runtime = await loader(tool)
          if (runtime) activeDrawerRuntime = runtime
          return
        }
        if (import.meta.env.DEV) {
          console.debug('[map-plugin-bridge] drawer', tool.pluginToolId)
        }
      })()
    },
    hideDrawerTool() {
      void stopActiveDrawerRuntime()
      if (import.meta.env.DEV) {
        console.debug('[map-plugin-bridge] hide drawer')
      }
    },
  }
}
