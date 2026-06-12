import path from 'node:path'
import { defineConfig } from 'vitest/config'

const uiDir = path.resolve(__dirname, '../../packages/ui')

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: [
      { find: '~', replacement: path.resolve(__dirname, 'app') },
      { find: '@repo/ui', replacement: uiDir },
      { find: /^@\/(.*)$/, replacement: `${uiDir}/src/$1` },
    ],
  },
})
