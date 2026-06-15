import {
  MAP_PLUGIN_MODULE_REGISTRY,
  MAP_PLUGIN_TOOL_REGISTRY,
  type MapPluginModuleToolId,
  type MapPluginToolId,
} from './map-plugin-registry'

/** packages-map 插件目录 slug（toolId 去掉 `-plugin` 后缀） */
export function mapPluginToolIdToSlug(pluginToolId: string): string | null {
  if (!pluginToolId.endsWith('-plugin')) {
    return null
  }
  return pluginToolId.slice(0, -'-plugin'.length)
}

/**
 * 父 monorepo packages-map 懒加载 entry 路径。
 * 例：`@haoxuan/map-plugins/measure-distance/lazyEntry`
 */
export function resolveMapPluginLazyEntryPath(pluginToolId: string): string | null {
  const slug = mapPluginToolIdToSlug(pluginToolId)
  if (!slug) {
    return null
  }
  const base = import.meta.env.VITE_MAP_PLUGINS_BASE ?? '@haoxuan/map-plugins'
  return `${base}/${slug}/lazyEntry`
}

export function listRegistryPluginToolIds(): string[] {
  return [
    ...(Object.keys(MAP_PLUGIN_TOOL_REGISTRY) as MapPluginToolId[]),
    ...(Object.keys(MAP_PLUGIN_MODULE_REGISTRY) as MapPluginModuleToolId[]),
  ]
}
