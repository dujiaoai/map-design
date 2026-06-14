import { describe, expect, it } from 'vitest'

import {
  setScopePermissionCodes,
  togglePermissionCode,
} from './role-permission-selection'

describe('role-permission-selection', () => {
  it('togglePermissionCode adds and removes codes', () => {
    expect(togglePermissionCode([], 'workspace:use')).toEqual(['workspace:use'])
    expect(togglePermissionCode(['workspace:use'], 'workspace:use')).toEqual([])
    expect(togglePermissionCode(['workspace:use'], 'workspace:map:read')).toEqual([
      'workspace:use',
      'workspace:map:read',
    ])
  })

  it('setScopePermissionCodes selects or clears a scope group', () => {
    const scopeCodes = ['workspace:use', 'workspace:map:read']
    expect(setScopePermissionCodes([], scopeCodes, true)).toEqual(scopeCodes)
    expect(setScopePermissionCodes(scopeCodes, scopeCodes, false)).toEqual([])
    expect(
      setScopePermissionCodes(['admin:members:read'], scopeCodes, true),
    ).toEqual(['admin:members:read', ...scopeCodes])
  })
})
