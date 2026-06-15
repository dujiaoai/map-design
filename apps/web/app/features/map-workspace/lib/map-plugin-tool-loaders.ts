import type { MapPluginDrawerLoader, MapPluginRuntime, MapPluginToolLoader } from './create-registry-map-plugin-bridge'
import type { ActiveDrawerTool, ActiveMapTool } from './workspace-url'
import { listRegistryPluginToolIds, resolveMapPluginLazyEntryPath } from './map-plugin-lazy-entry-paths'

export type MapPluginLazyEntryHandle = {
  activate?: (context?: unknown) => void | Promise<void>
  deactivate?: () => void | Promise<void>
  stop?: () => void | Promise<void>
}

type LazyEntryModule = Record<string, unknown>

function pickLazyEntryFactory(mod: LazyEntryModule): (() => MapPluginLazyEntryHandle) | null {
  for (const value of Object.values(mod)) {
    if (typeof value === 'function' && value.name.includes('LazyEntry')) {
      return value as () => MapPluginLazyEntryHandle
    }
  }
  if (typeof mod.default === 'function') {
    return mod.default as () => MapPluginLazyEntryHandle
  }
  return null
}

async function loadLazyEntryRuntime(pluginToolId: string): Promise<MapPluginRuntime | void> {
  const entryPath = resolveMapPluginLazyEntryPath(pluginToolId)
  if (!entryPath) {
    return
  }

  try {
    const mod = (await import(/* @vite-ignore */ entryPath)) as LazyEntryModule
    const factory = pickLazyEntryFactory(mod)
    if (!factory) {
      if (import.meta.env.DEV) {
        console.warn('[map-plugin-loaders] lazyEntry factory not found', pluginToolId, entryPath)
      }
      return
    }

    const handle = factory()
    await handle.activate?.({ pluginToolId })

    return {
      stop: async () => {
        if (handle.deactivate) {
          await handle.deactivate()
          return
        }
        await handle.stop?.()
      },
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        '[map-plugin-loaders] packages-map entry unavailable',
        pluginToolId,
        entryPath,
        error,
      )
    }
  }
}

function createToolLoader(pluginToolId: string): MapPluginToolLoader {
  return async (_tool: ActiveMapTool) => loadLazyEntryRuntime(pluginToolId)
}

function createDrawerLoader(pluginToolId: string): MapPluginDrawerLoader {
  return async (_tool: ActiveDrawerTool) => loadLazyEntryRuntime(pluginToolId)
}

/** Phase C：为 registry 中已知 pluginToolId 生成 lazy loader（需 packages-map + VITE_MAP_PLUGIN_LOADERS） */
export function createMapPluginToolLoaders(): Partial<Record<string, MapPluginToolLoader>> {
  const loaders: Partial<Record<string, MapPluginToolLoader>> = {}
  for (const pluginToolId of listRegistryPluginToolIds()) {
    loaders[pluginToolId] = createToolLoader(pluginToolId)
  }
  return loaders
}

export function createMapPluginDrawerLoaders(): Partial<Record<string, MapPluginDrawerLoader>> {
  return {
    'import-file-plugin': createDrawerLoader('import-file-plugin'),
  }
}

export function isMapPluginLoadersEnabled(): boolean {
  return import.meta.env.VITE_MAP_PLUGIN_LOADERS === 'true'
}
