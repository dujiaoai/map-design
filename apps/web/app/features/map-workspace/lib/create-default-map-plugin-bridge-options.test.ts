import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDefaultMapPluginBridgeOptions } from './create-default-map-plugin-bridge-options'
import { isMapPluginLoadersEnabled } from './map-plugin-tool-loaders'

describe('createDefaultMapPluginBridgeOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns empty options when loaders disabled', () => {
    vi.stubEnv('VITE_MAP_PLUGIN_LOADERS', 'false')
    expect(createDefaultMapPluginBridgeOptions()).toEqual({})
    expect(isMapPluginLoadersEnabled()).toBe(false)
  })

  it('registers tool loaders for registry ids when enabled', () => {
    vi.stubEnv('VITE_MAP_PLUGIN_LOADERS', 'true')
    const options = createDefaultMapPluginBridgeOptions()
    expect(options.toolLoaders?.['measure-distance-plugin']).toBeTypeOf('function')
    expect(options.drawerLoaders?.['import-file-plugin']).toBeTypeOf('function')
    expect(isMapPluginLoadersEnabled()).toBe(true)
  })
})
