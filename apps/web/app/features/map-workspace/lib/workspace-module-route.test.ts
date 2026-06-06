import { describe, expect, it } from 'vitest'

import {
  buildWorkspaceModulePath,
  parseWorkspaceModulePath,
  resolveModuleSectionByNavItemId,
} from './workspace-module-route'

describe('workspace-module-route', () => {
  it('builds and parses module sub-routes', () => {
    const path = buildWorkspaceModulePath({ section: 'ops', moduleId: 'view-project' })
    expect(path).toBe('/ops/view-project')
    expect(parseWorkspaceModulePath(path)).toEqual({
      section: 'ops',
      moduleId: 'view-project',
    })
  })

  it('rejects unknown module in section', () => {
    expect(parseWorkspaceModulePath('/ops/unknown')).toBeNull()
  })

  it('resolves section from nav item id', () => {
    expect(resolveModuleSectionByNavItemId('module-thematic')).toBe('data')
    expect(resolveModuleSectionByNavItemId('dock-uav-list')).toBe('uav')
    expect(resolveModuleSectionByNavItemId('module-view-project')).toBe('ops')
    expect(resolveModuleSectionByNavItemId('module-panorama-viewer')).toBe('panorama')
  })
})
