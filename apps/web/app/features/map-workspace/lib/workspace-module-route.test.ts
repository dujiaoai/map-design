import { describe, expect, it } from 'vitest'

import {
  isKnownModuleInSection,
  parseWorkspaceModulePath,
  resolveModuleSectionByNavItemId,
} from './workspace-module-route'

describe('workspace-module-route', () => {
  it('parses data module path', () => {
    expect(parseWorkspaceModulePath('/data/thematic')).toEqual({
      section: 'data',
      moduleId: 'thematic',
    })
  })

  it('parses ops module path', () => {
    expect(parseWorkspaceModulePath('/ops/view-project')).toEqual({
      section: 'ops',
      moduleId: 'view-project',
    })
  })

  it('rejects unknown module in section', () => {
    expect(parseWorkspaceModulePath('/data/unknown-module')).toBeNull()
    expect(parseWorkspaceModulePath('/panorama/panorama-viewer')).toBeNull()
  })

  it('maps nav item to module section', () => {
    expect(resolveModuleSectionByNavItemId('module-thematic')).toBe('data')
    expect(resolveModuleSectionByNavItemId('module-view-project')).toBe('ops')
    expect(isKnownModuleInSection('ops', 'view-project')).toBe(true)
  })
})
