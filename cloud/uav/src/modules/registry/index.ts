import {
  cloudPluginModuleManifest,
  getModuleAssetPath,
  resolveModuleManifestItem,
} from '@/shared/config/module-manifest'
import type { CloudPluginUavModule } from '@/shared/types/module'

export interface CloudPluginModuleInfo {
  id: string
  title: string
  entry: string
}

export interface LoadCloudPluginModuleOptions {
  /** dev remount 时追加 query，避免入口 ESM 被浏览器缓存 */
  bust?: number
}

export function listModules(): CloudPluginModuleInfo[] {
  return cloudPluginModuleManifest.map(({ id, title }) => ({
    id,
    title,
    entry: getModuleAssetPath(id),
  }))
}

export function resolveModuleEntry(moduleId: string): string {
  resolveModuleManifestItem(moduleId)
  return getModuleAssetPath(moduleId)
}

/** 按 moduleId 动态加载远程 ESM 子模块 */
export async function loadModule(
  moduleId: string,
  options?: LoadCloudPluginModuleOptions,
): Promise<CloudPluginUavModule> {
  const entry = resolveModuleEntry(moduleId)
  const url = options?.bust ? `${entry}?t=${options.bust}` : entry
  return import(/* @vite-ignore */ url)
}

export { cloudPluginModuleManifest }
