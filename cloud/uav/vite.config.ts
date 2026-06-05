import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { cloudPluginModuleManifest } from './src/shared/config/module-manifest'
import {
  devImportVersionPlugin,
  devImportVersionPostPlugin,
  devReloadPlugin,
} from './vite-plugin-dev-reload'
import {
  devRemoteEntryPlugin,
  resolveDevOrigin,
  resolveModuleBuildEntries,
} from './vite-plugin-dev-remote-entry'
import { devStubViteClientPlugin } from './vite-plugin-dev-stub-client'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const uiReactDir = path.resolve(rootDir, '../../packages/ui')
const buildEntries = resolveModuleBuildEntries(rootDir, cloudPluginModuleManifest)

export default defineConfig({
  base: '/yunyan-cloud-uav/',
  // dev 走 esbuild jsx，避免 @vitejs/plugin-react 对外部宿主注入 Refresh preamble
  esbuild: {
    jsx: 'automatic',
  },
  plugins: [
    devStubViteClientPlugin(),
    tailwindcss(),
    devRemoteEntryPlugin(buildEntries),
    devImportVersionPlugin(rootDir),
    devImportVersionPostPlugin(rootDir),
    devReloadPlugin(),
  ],
  resolve: {
    alias: [
      { find: '@repo/ui', replacement: uiReactDir },
      // shadcn 组件内 @/ 路径（避免被下方 cloud-plugin @/ 误解析）
      { find: /^@\/lib\/(.*)$/, replacement: `${uiReactDir}/src/lib/$1` },
      { find: /^@\//, replacement: `${path.resolve(rootDir, 'src')}/` },
    ],
  },
  server: {
    port: 5174,
    strictPort: true,
    cors: true,
    // 禁用 HMR WebSocket：模块经宿主 proxy 加载时，否则会向宿主页广播 full-reload
    hmr: false,
    // 宿主经 proxy 加载时，子模块/CSS 须走宿主同源路径（见 README）
    origin: resolveDevOrigin(),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    lib: {
      entry: buildEntries,
      formats: ['es'],
      fileName: (_format, entryName) => `assets/${entryName}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
