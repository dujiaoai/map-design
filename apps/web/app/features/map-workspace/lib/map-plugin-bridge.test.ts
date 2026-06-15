import { afterEach, describe, expect, it, vi } from 'vitest'

import { createRegistryMapPluginBridge } from './create-registry-map-plugin-bridge'
import {
  getMapPluginBridge,
  isMapEngineReady,
  isMapPluginBridgeAttached,
  isMapSdkMounted,
  markMapSdkMounted,
  resetMapPluginBridge,
  setMapPluginBridge,
} from './map-plugin-bridge'

describe('map-plugin-bridge attachment', () => {
  afterEach(() => {
    resetMapPluginBridge()
    vi.unstubAllEnvs()
  })

  it('isMapPluginBridgeAttached after setMapPluginBridge', () => {
    expect(isMapPluginBridgeAttached()).toBe(false)
    setMapPluginBridge(createRegistryMapPluginBridge())
    expect(isMapPluginBridgeAttached()).toBe(true)
    expect(getMapPluginBridge()).toBeDefined()
  })

  it('bridge attachment does not imply map engine ready', () => {
    setMapPluginBridge(createRegistryMapPluginBridge())
    expect(isMapPluginBridgeAttached()).toBe(true)
    expect(isMapEngineReady()).toBe(false)
    expect(isMapSdkMounted()).toBe(false)
  })

  it('markMapSdkMounted signals engine ready', () => {
    markMapSdkMounted()
    expect(isMapSdkMounted()).toBe(true)
    expect(isMapEngineReady()).toBe(true)
  })

  it('VITE_MAP_ENGINE_READY bypasses sdk mount', () => {
    vi.stubEnv('VITE_MAP_ENGINE_READY', 'true')
    expect(isMapEngineReady()).toBe(true)
    expect(isMapSdkMounted()).toBe(false)
  })

  it('resetMapPluginBridge clears attachment', () => {
    setMapPluginBridge(createRegistryMapPluginBridge())
    markMapSdkMounted()
    resetMapPluginBridge()
    expect(isMapPluginBridgeAttached()).toBe(false)
    expect(isMapSdkMounted()).toBe(false)
  })
})

describe('createRegistryMapPluginBridge', () => {
  it('calls tool loader and stop on lifecycle', async () => {
    const stop = vi.fn()
    const loader = vi.fn(async () => ({ stop }))
    const bridge = createRegistryMapPluginBridge({
      toolLoaders: {
        'measure-distance-plugin': loader,
      },
    })

    bridge.startMapTool({
      navItemId: 'tool-measure-distance',
      toolId: 'measure-distance',
      pluginToolId: 'measure-distance-plugin',
    })
    await vi.waitFor(() => expect(loader).toHaveBeenCalledOnce())

    bridge.stopMapTool()
    await vi.waitFor(() => expect(stop).toHaveBeenCalledOnce())
  })

  it('calls drawer loader stop on hideDrawerTool', async () => {
    const stop = vi.fn()
    const loader = vi.fn(async () => ({ stop }))
    const bridge = createRegistryMapPluginBridge({
      drawerLoaders: {
        'import-file-plugin': loader,
      },
    })

    bridge.showDrawerTool({
      navItemId: 'tool-import-file',
      toolId: 'import-file',
      pluginToolId: 'import-file-plugin',
    })
    await vi.waitFor(() => expect(loader).toHaveBeenCalledOnce())

    bridge.hideDrawerTool()
    await vi.waitFor(() => expect(stop).toHaveBeenCalledOnce())
  })
})
