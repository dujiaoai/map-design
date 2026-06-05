import fs from 'node:fs'
import type { ServerResponse } from 'node:http'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

const RELOAD_EVENTS_PATH = '/yunyan-cloud-uav/__dev/reload-events'
const PLUGIN_SRC_SEGMENT = '/cloud-plugin-uav/src/'
const UI_REACT_SRC_SEGMENT = '/packages/ui-react/src/'
const DEV_SRC_URL_PREFIX = '/yunyan-cloud-uav/src/'
const DEV_SRC_SHORT_PREFIX = '/src/'

const SOURCE_FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'] as const
const INDEX_FILE_NAMES = ['index.tsx', 'index.ts', 'index.jsx', 'index.js'] as const

function resolveExistingSourceFile(basePath: string): string | undefined {
  if (fs.existsSync(basePath)) {
    const stat = fs.statSync(basePath)
    if (stat.isFile()) return basePath
    if (stat.isDirectory()) {
      for (const entry of INDEX_FILE_NAMES) {
        const indexPath = path.join(basePath, entry)
        if (fs.existsSync(indexPath)) return indexPath
      }
    }
  }

  for (const ext of SOURCE_FILE_EXTENSIONS) {
    const withExt = `${basePath}${ext}`
    if (fs.existsSync(withExt)) return withExt
  }

  return undefined
}

function resolveDevSrcImport(rootDir: string, id: string): string | undefined {
  const pathname = id.split('?', 1)[0]
  let relativePath: string | undefined

  if (pathname.startsWith(DEV_SRC_URL_PREFIX)) {
    relativePath = pathname.slice(DEV_SRC_URL_PREFIX.length)
  } else if (pathname.startsWith(DEV_SRC_SHORT_PREFIX)) {
    relativePath = pathname.slice(DEV_SRC_SHORT_PREFIX.length)
  }

  if (!relativePath) return

  return resolveExistingSourceFile(path.resolve(rootDir, 'src', relativePath))
}

function withImportVersion(importPath: string, v: string): string {
  return importPath.includes('?v=') ? importPath : `${importPath}?v=${v}`
}

/** 将 dev import 规范化为带扩展名的 /yunyan-cloud-uav/src/... 路径，供浏览器直接请求 */
function toVersionedDevSrcUrl(rootDir: string, importPath: string, v: string): string {
  const pathname = importPath.split('?', 1)[0]
  let relativePath: string | undefined

  if (pathname.startsWith(DEV_SRC_URL_PREFIX)) {
    relativePath = pathname.slice(DEV_SRC_URL_PREFIX.length)
  } else if (pathname.startsWith(DEV_SRC_SHORT_PREFIX)) {
    relativePath = pathname.slice(DEV_SRC_SHORT_PREFIX.length)
  }

  if (!relativePath) return withImportVersion(importPath, v)

  const resolved = resolveExistingSourceFile(path.resolve(rootDir, 'src', relativePath))
  if (!resolved) return withImportVersion(importPath, v)

  const rel = path.relative(path.join(rootDir, 'src'), resolved).replace(/\\/g, '/')
  return withImportVersion(`${DEV_SRC_URL_PREFIX}${rel}`, v)
}

function patchDevImportPaths(
  rootDir: string,
  code: string,
  v: string,
  options?: { patchAtAlias?: boolean },
): string {
  let next = code
    .replace(
      /(from\s+["'])(\/yunyan-cloud-uav\/src\/[^"']+)(["'])/g,
      (_, pre, importPath, post) => `${pre}${toVersionedDevSrcUrl(rootDir, importPath, v)}${post}`,
    )
    .replace(
      /(import\s+["'])(\/yunyan-cloud-uav\/src\/[^"']+)(["'])/g,
      (_, pre, importPath, post) => `${pre}${toVersionedDevSrcUrl(rootDir, importPath, v)}${post}`,
    )

  if (options?.patchAtAlias) {
    next = next.replace(
      /(from\s+["'])@\/([^"']+)(["'])/g,
      (_, pre, importPath, post) =>
        `${pre}${toVersionedDevSrcUrl(rootDir, `${DEV_SRC_URL_PREFIX}${importPath}`, v)}${post}`,
    )
  }

  return next
}

function shouldPatchDevImports(id: string): boolean {
  const normalized = id.replace(/\\/g, '/')
  if (!normalized.includes('/cloud-plugin-uav/src/')) return false
  // index.html 独立预览不走宿主 remount，保持 @/ alias 即可
  if (normalized.includes('/cloud-plugin-uav/src/dev/')) return false
  return true
}

/** 浏览器可能请求无扩展名的 /yunyan-cloud-uav/src/...，重写为真实源文件 */
function configureExtensionlessDevSrcMiddleware(rootDir: string): Plugin['configureServer'] {
  return (server) => {
    server.middlewares.use((req, _res, next) => {
      const rawUrl = req.url ?? ''
      const pathname = rawUrl.split('?', 1)[0]
      if (!pathname.startsWith(DEV_SRC_URL_PREFIX)) {
        next()
        return
      }
      if (SOURCE_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
        next()
        return
      }

      const resolved = resolveDevSrcImport(rootDir, pathname)
      if (!resolved) {
        next()
        return
      }

      const rel = path.relative(path.join(rootDir, 'src'), resolved).replace(/\\/g, '/')
      const search = rawUrl.includes('?') ? rawUrl.slice(rawUrl.indexOf('?')) : ''
      req.url = `${DEV_SRC_URL_PREFIX}${rel}${search}`
      next()
    })
  }
}

let invalidateToken = String(Date.now())

export function getDevInvalidateToken(): string {
  return invalidateToken
}

function bumpDevInvalidateToken(): void {
  invalidateToken = String(Date.now())
}

function isSourceFile(file: string): boolean {
  const normalized = file.replace(/\\/g, '/')
  return normalized.includes(PLUGIN_SRC_SEGMENT) || normalized.includes(UI_REACT_SRC_SEGMENT)
}

function notifyReloadClients(clients: Set<ServerResponse>): void {
  for (const res of clients) {
    res.write('event: reload\ndata: {}\n\n')
  }
}

function watchSourceChanges(server: ViteDevServer, clients: Set<ServerResponse>): void {
  const onFileEvent = (file: string) => {
    if (!isSourceFile(file)) return
    bumpDevInvalidateToken()
    notifyReloadClients(clients)
  }

  server.watcher.on('change', onFileEvent)
  server.watcher.on('add', onFileEvent)
  server.watcher.on('unlink', onFileEvent)
}

/** dev：源码变更 SSE + 全链路 import 版本戳（供宿主 remount 绕过 ESM 缓存） */
export function devReloadPlugin(): Plugin {
  const clients = new Set<ServerResponse>()

  return {
    name: 'cloud-plugin-uav-dev-reload',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(RELOAD_EVENTS_PATH, (req, res, next) => {
        if (req.method !== 'GET') {
          next()
          return
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        })
        res.write(': connected\n\n')
        clients.add(res)
        req.on('close', () => clients.delete(res))
      })

      watchSourceChanges(server, clients)
    },
  }
}

/** 为 /src/ import 追加 ?v=token，确保 remount 时拉取最新模块树 */
export function devImportVersionPlugin(rootDir: string): Plugin {
  return {
    name: 'cloud-plugin-uav-dev-import-version',
    apply: 'serve',
    enforce: 'pre',
    configureServer: configureExtensionlessDevSrcMiddleware(rootDir),
    resolveId(id) {
      return resolveDevSrcImport(rootDir, id)
    },
    transform(code, id) {
      if (!shouldPatchDevImports(id)) return
      const next = patchDevImportPaths(rootDir, code, getDevInvalidateToken(), {
        patchAtAlias: true,
      })
      if (next !== code) return next
    },
  }
}

/** post 阶段再补一遍，覆盖 esbuild 解析后的绝对路径 import */
export function devImportVersionPostPlugin(rootDir: string): Plugin {
  return {
    name: 'cloud-plugin-uav-dev-import-version-post',
    apply: 'serve',
    enforce: 'post',
    resolveId(id) {
      return resolveDevSrcImport(rootDir, id)
    },
    transform(code, id) {
      if (!shouldPatchDevImports(id)) return
      const next = patchDevImportPaths(rootDir, code, getDevInvalidateToken())
      if (next !== code) return next
    },
  }
}

export const DEV_RELOAD_EVENTS_PATH = RELOAD_EVENTS_PATH
