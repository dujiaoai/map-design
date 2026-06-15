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
      'measure-area',
      'plot-point',
      'pick-point',
      'locate-point',
      'swipe-compare',
      'hd-image-compare',
      'admin-divisions',
    ])
    for (const id of REGISTERED_MOCK_TOOL_IDS) {
      expect(isRegisteredMockToolId(id)).toBe(true)
    }
    expect(isRegisteredMockToolId('unknown-tool')).toBe(false)
  })

  it('lists registered mock module ids', () => {
    expect(REGISTERED_MOCK_MODULE_IDS).toContain('thematic')
    expect(REGISTERED_MOCK_MODULE_IDS).toContain('scenic-spots')
    expect(REGISTERED_MOCK_MODULE_IDS).toContain('legend')
    expect(REGISTERED_MOCK_MODULE_IDS).toContain('spatial-analysis')
    expect(REGISTERED_MOCK_MODULE_IDS).toContain('property-view')
    expect(isRegisteredMockModuleId('flight-ledger')).toBe(true)
    expect(isRegisteredMockModuleId('flight-ai-alerts')).toBe(true)
    expect(isRegisteredMockModuleId('video-monitor')).toBe(true)
    expect(isRegisteredMockModuleId('uav-list')).toBe(true)
    expect(isRegisteredMockModuleId('uav-collect')).toBe(true)
  })

  it('lists registered mock drawer tool ids', () => {
    expect(REGISTERED_MOCK_DRAWER_TOOL_IDS).toEqual(['global-search', 'import-file'])
    expect(isRegisteredMockDrawerToolId('global-search')).toBe(true)
    expect(isRegisteredMockDrawerToolId('import-file')).toBe(true)
    expect(isRegisteredMockDrawerToolId('unknown')).toBe(false)
  })
})
