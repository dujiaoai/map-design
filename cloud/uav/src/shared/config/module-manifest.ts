/** 插件对外暴露的远程模块清单（构建与 registry 共用） */
export const CLOUD_PLUGIN_UAV_BASE = '/yunyan-cloud-uav/'

export interface CloudPluginModuleManifestItem {
  id: string
  title: string
  /** 源码入口，相对 cloud-plugin-uav 包根目录 */
  source: string
}

export const cloudPluginModuleManifest = [
  {
    id: 'dock-dashboard',
    title: '机库看板',
    source: 'src/modules/dock-dashboard/index.tsx',
  },
] as const satisfies readonly CloudPluginModuleManifestItem[]

export type CloudPluginModuleId = (typeof cloudPluginModuleManifest)[number]['id']

export function resolveModuleManifestItem(moduleId: string): CloudPluginModuleManifestItem {
  const item = cloudPluginModuleManifest.find((mod) => mod.id === moduleId)
  if (!item) {
    throw new Error(`[cloud-plugin-uav] unknown module: ${moduleId}`)
  }
  return item
}

export function getModuleAssetPath(moduleId: string): string {
  return `${CLOUD_PLUGIN_UAV_BASE}assets/${moduleId}.js`
}

export function getRegistryAssetPath(): string {
  return `${CLOUD_PLUGIN_UAV_BASE}assets/registry.js`
}
