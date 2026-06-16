import { describe, expect, it } from 'vitest'

import type { AdminPermission } from '~/shared/api/admin-api'

import {
  filterTransferItemsByQuery,
  permissionsToTransferItems,
} from './role-permission-transfer'

const SAMPLE: AdminPermission[] = [
  {
    id: '1',
    code: 'admin:users:read',
    name: '查看用户',
    description: '',
    scope: 'platform',
    moduleId: null,
    moduleCode: null,
    moduleName: null,
    system: true,
  },
  {
    id: '2',
    code: 'admin:tenants:write',
    name: '编辑租户',
    description: '',
    scope: 'platform',
    moduleId: null,
    moduleCode: null,
    moduleName: null,
    system: true,
  },
]

describe('permissionsToTransferItems', () => {
  it('maps permission code to transfer key', () => {
    expect(permissionsToTransferItems(SAMPLE)).toEqual([
      { key: 'admin:users:read', title: '查看用户', description: 'admin:users:read' },
      { key: 'admin:tenants:write', title: '编辑租户', description: 'admin:tenants:write' },
    ])
  })
})

describe('filterTransferItemsByQuery', () => {
  it('filters by code or title', () => {
    const items = permissionsToTransferItems(SAMPLE)
    expect(filterTransferItemsByQuery(items, 'users')).toHaveLength(1)
    expect(filterTransferItemsByQuery(items, '编辑')).toHaveLength(1)
  })
})
