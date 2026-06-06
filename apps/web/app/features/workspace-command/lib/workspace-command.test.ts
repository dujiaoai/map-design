import { describe, expect, it } from 'vitest'

import {
  buildWorkspaceCommandRegistry,
  filterCommandItems,
  resolveCommandItems,
  workspaceActionKey,
} from '~/features/workspace-command'

describe('workspace command registry', () => {
  it('includes nav tools and system commands', () => {
    const registry = buildWorkspaceCommandRegistry()
    expect(registry.some((item) => item.id === 'nav:tool-measure-distance')).toBe(true)
    expect(registry.some((item) => item.id === 'system-clear-tools')).toBe(true)
    expect(registry.some((item) => item.id === 'nav:module-thematic')).toBe(true)
  })

  it('filters commands by query tokens', () => {
    const registry = buildWorkspaceCommandRegistry()
    const filtered = filterCommandItems(registry, '测距')
    expect(filtered.some((item) => item.title === '测距')).toBe(true)
    expect(filtered.some((item) => item.title === '看项目')).toBe(false)
  })

  it('adds map search suggestions when typing', () => {
    const registry = buildWorkspaceCommandRegistry()
    const items = resolveCommandItems({
      query: '西湖',
      registry,
      recentActionKeys: [],
    })

    expect(items.some((item) => item.group === 'search')).toBe(true)
  })

  it('builds stable action keys for history', () => {
    expect(workspaceActionKey({ type: 'selectNav', navItemId: 'tool-measure-distance' })).toBe(
      'nav:tool-measure-distance',
    )
    expect(workspaceActionKey({ type: 'clearTools' })).toBe('system:clear-tools')
  })
})
