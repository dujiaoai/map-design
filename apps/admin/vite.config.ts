import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.resolve(__dirname, '../..')
const uiDir = path.resolve(__dirname, '../../packages/ui')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, monorepoRoot, '')

  return {
    plugins: [tailwindcss(), reactRouter()],
    define: Object.fromEntries(
      Object.entries(env)
        .filter(([key]) => key.startsWith('VITE_'))
        .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
    ),
    resolve: {
      tsconfigPaths: true,
      alias: [
        { find: '@repo/ui', replacement: uiDir },
        { find: /^@\/(.*)$/, replacement: `${uiDir}/src/$1` },
      ],
    },
    server: {
      port: 5181,
      strictPort: false,
      proxy: {
        '/v1/billing': {
          target: env.VITE_BILLING_API_HOST || 'http://localhost:8083',
          changeOrigin: true,
        },
        '/v1': {
          target: env.VITE_SAAS_API_HOST || 'http://localhost:8082',
          changeOrigin: true,
        },
      },
    },
  }
})
