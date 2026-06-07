import { describe, expect, it } from 'vitest'

import { mockModuleMeta, mockToolMeta } from '~/entities/navigation'

import {
  MAP_PLUGIN_MODULE_REGISTRY,
  MAP_PLUGIN_TOOL_REGISTRY,
  isKnownPluginModuleToolId,
  isKnownPluginToolId,
} from './map-plugin-registry'

describe('map-plugin-registry', () => {
  it('registers all mock tool pluginToolIds', () => {
    const toolPluginIds = [...new Set(Object.values(mockToolMeta).map((meta) => meta.pluginToolId))]

    for (const pluginToolId of toolPluginIds) {
      expect(isKnownPluginToolId(pluginToolId), pluginToolId).toBe(true)
    }
  })

  it('registers all mock module pluginToolIds', () => {
    const modulePluginIds = Object.values(mockModuleMeta)
      .map((meta) => meta.pluginToolId)
      .filter((id): id is string => Boolean(id))

    for (const pluginToolId of modulePluginIds) {
      expect(isKnownPluginModuleToolId(pluginToolId), pluginToolId).toBe(true)
    }
  })

  it('labels region navigator as 行政区划', () => {
    expect(MAP_PLUGIN_TOOL_REGISTRY['region-navigator-plugin'].label).toBe('行政区划')
  })

  it('keeps module registry aligned with mockModuleMeta moduleIds', () => {
    for (const entry of Object.values(MAP_PLUGIN_MODULE_REGISTRY)) {
      expect(mockModuleMeta[entry.moduleId]?.pluginToolId).toBeDefined()
    }
  })
})
