import { describe, expect, it } from 'vitest'

import {
  isRegisteredMockDrawerToolId,
  isRegisteredMockModuleId,
  isRegisteredMockToolId,
  REGISTERED_MOCK_DRAWER_TOOL_IDS,
  REGISTERED_MOCK_MODULE_IDS,
  REGISTERED_MOCK_TOOL_IDS,
} from './registry-catalog'

describe('mock-workspace-content registry catalog', () => {
  it('lists registered mock tool ids', () => {
    expect(REGISTERED_MOCK_TOOL_IDS).toEqual([
      'measure-distance',
      'plot-point',
      'swipe-compare',
    ])
    for (const id of REGISTERED_MOCK_TOOL_IDS) {
      expect(isRegisteredMockToolId(id)).toBe(true)
    }
    expect(isRegisteredMockToolId('unknown-tool')).toBe(false)
  })

  it('lists registered mock module ids', () => {
    expect(REGISTERED_MOCK_MODULE_IDS).toContain('thematic')
    expect(isRegisteredMockModuleId('flight-ledger')).toBe(true)
    expect(isRegisteredMockModuleId('uav-list')).toBe(false)
  })

  it('lists registered mock drawer tool ids', () => {
    expect(REGISTERED_MOCK_DRAWER_TOOL_IDS).toEqual(['global-search'])
    expect(isRegisteredMockDrawerToolId('global-search')).toBe(true)
    expect(isRegisteredMockDrawerToolId('import-file')).toBe(false)
  })
})
