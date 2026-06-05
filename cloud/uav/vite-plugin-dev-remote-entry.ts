import path from 'node:path'
import type { Plugin } from 'vite'
import { getDevInvalidateToken } from './vite-plugin-dev-reload'

const VIRTUAL_PREFIX = 'virtual:cloud-plugin-uav-'

export const REGISTRY_ENTRY_NAME = 'registry'

/** 生产构建产物路径前缀，与 build.lib.fileName 保持一致 */
export function getRemoteEntryUrl(entryName: string): string {
  return `/yunyan-cloud-uav/assets/${entryName}.js`
}

function toVirtualId(entryName: string): string {
  return `${VIRTUAL_PREFIX}${entryName}`
}

function toResolvedVirtualId(entryName: string): string {
  return `\0${toVirtualId(entryName)}`
}

/**
 * dev 模式下将远程入口 URL 映射到源码入口，走 Vite 正常 transform 管道。
 * 不可使用 transformRequest 直出 TSX（会绕过 @vitejs/plugin-react preamble）。
 */
export function devRemoteEntryPlugin(entries: Record<string, string>): Plugin {
  const normalizedEntries = Object.fromEntries(
    Object.entries(entries).map(([name, entry]) => [name, entry.replace(/\\/g, '/')]),
  )

  return {
    name: 'cloud-plugin-uav-dev-remote-entry',
    apply: 'serve',
    resolveId(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) return toResolvedVirtualId(id.slice(VIRTUAL_PREFIX.length))
    },
    load(id) {
      const entryName = Object.entries(normalizedEntries).find(
        ([name]) => toResolvedVirtualId(name) === id,
      )?.[0]
      if (!entryName) return

      const entryPath = normalizedEntries[entryName]
      const versionedEntry = `${entryPath}?v=${getDevInvalidateToken()}`
      return `export * from ${JSON.stringify(versionedEntry)}`
    },
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url ?? ''
        const [pathname, search = ''] = raw.split('?')
        const matchedEntry = Object.keys(normalizedEntries).find(
          (name) => pathname === getRemoteEntryUrl(name) || pathname === `/assets/${name}.js`,
        )

        if (!matchedEntry) {
          next()
          return
        }

        req.url = `/yunyan-cloud-uav/@id/${toVirtualId(matchedEntry)}${search ? `?${search}` : ''}`
        next()
      })
    },
  }
}

export function resolveDevOrigin(): string {
  return process.env.CLOUD_PLUGIN_UAV_DEV_ORIGIN ?? 'http://localhost:5103'
}

export function resolveModuleBuildEntries(
  rootDir: string,
  manifest: readonly { id: string; source: string }[],
) {
  const entries: Record<string, string> = {
    [REGISTRY_ENTRY_NAME]: path.resolve(rootDir, 'src/modules/registry/index.ts'),
  }

  for (const mod of manifest) {
    entries[mod.id] = path.resolve(rootDir, mod.source)
  }

  return entries
}
