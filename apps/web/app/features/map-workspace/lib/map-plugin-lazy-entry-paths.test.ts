import { describe, expect, it } from 'vitest'

import { mapPluginToolIdToSlug, resolveMapPluginLazyEntryPath } from './map-plugin-lazy-entry-paths'

describe('map-plugin-lazy-entry-paths', () => {
  it('maps pluginToolId to packages-map slug', () => {
    expect(mapPluginToolIdToSlug('measure-distance-plugin')).toBe('measure-distance')
    expect(mapPluginToolIdToSlug('import-file-plugin')).toBe('import-file')
    expect(mapPluginToolIdToSlug('video-monitor')).toBeNull()
  })

  it('builds lazyEntry import path', () => {
    expect(resolveMapPluginLazyEntryPath('measure-distance-plugin')).toBe(
      '@haoxuan/map-plugins/measure-distance/lazyEntry',
    )
  })
})
