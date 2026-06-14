import { describe, expect, it } from 'vitest'

import type { AdminPermission } from '~/shared/api/admin-api'

import {
  buildPermissionActionTree,
  collectPermissionCodes,
  filterPermissionsByQuery,
  resolvePermissionGroupSegments,
  shouldUsePermissionActionTree,
  stripModulePrefix,
} from './permission-action-tree'

function permission(
  partial: Pick<AdminPermission, 'code' | 'name'> & Partial<AdminPermission>,
): AdminPermission {
  return {
    id: partial.id ?? partial.code,
    description: partial.description ?? '',
    scope: partial.scope ?? 'workspace',
    moduleId: partial.moduleId ?? null,
    moduleCode: partial.moduleCode ?? null,
    moduleName: partial.moduleName ?? null,
    system: partial.system ?? false,
    ...partial,
  }
}

describe('stripModulePrefix', () => {
  it('strips underscore module code prefix', () => {
    expect(stripModulePrefix('map_tools:layer:read', 'map_tools')).toBe('layer:read')
  })

  it('strips colonized module alias prefix', () => {
    expect(stripModulePrefix('admin:tenants:read', 'admin_tenants')).toBe('read')
  })
})

describe('buildPermissionActionTree', () => {
  it('groups permissions by action segments under module', () => {
    const permissions = [
      permission({ code: 'map_tools:layer:read', name: '图层读', moduleCode: 'map_tools' }),
      permission({ code: 'map_tools:layer:write', name: '图层写', moduleCode: 'map_tools' }),
      permission({ code: 'map_tools:export:csv', name: '导出', moduleCode: 'map_tools' }),
      permission({ code: 'map_tools:use', name: '使用', moduleCode: 'map_tools' }),
    ]

    const tree = buildPermissionActionTree(permissions, 'map_tools')
    expect(tree.map((node) => (node.kind === 'group' ? node.segment : node.permission.code))).toEqual([
      'export',
      'layer',
      'map_tools:use',
    ])
    expect(collectPermissionCodes(tree)).toEqual([
      'map_tools:export:csv',
      'map_tools:layer:read',
      'map_tools:layer:write',
      'map_tools:use',
    ])
  })

  it('supports nested action groups', () => {
    const permissions = [
      permission({
        code: 'map_tools:layer:tile:read',
        name: '瓦片读',
        moduleCode: 'map_tools',
      }),
    ]
    const tree = buildPermissionActionTree(permissions, 'map_tools')
    expect(tree[0]?.kind).toBe('group')
    if (tree[0]?.kind === 'group') {
      expect(tree[0].segment).toBe('layer')
      expect(tree[0].children[0]?.kind).toBe('group')
      if (tree[0].children[0]?.kind === 'group') {
        expect(tree[0].children[0].segment).toBe('tile')
      }
    }
  })
})

describe('filterPermissionsByQuery', () => {
  it('matches code, name and group segment', () => {
    const permissions = [
      permission({ code: 'map_tools:layer:read', name: '图层只读', moduleCode: 'map_tools' }),
      permission({ code: 'map_tools:export:csv', name: '导出 CSV', moduleCode: 'map_tools' }),
    ]
    expect(filterPermissionsByQuery(permissions, 'layer').map((item) => item.code)).toEqual([
      'map_tools:layer:read',
    ])
    expect(filterPermissionsByQuery(permissions, '导出').map((item) => item.code)).toEqual([
      'map_tools:export:csv',
    ])
  })
})

describe('resolvePermissionGroupSegments', () => {
  it('returns empty path for single action segment', () => {
    expect(
      resolvePermissionGroupSegments(
        permission({ code: 'workspace:use', name: 'use', moduleCode: 'workspace' }),
        'workspace',
      ),
    ).toEqual([])
  })
})

describe('shouldUsePermissionActionTree', () => {
  it('enables tree mode for larger catalogs', () => {
    const many = Array.from({ length: 8 }, (_, index) =>
      permission({ code: `map_tools:item:${index}`, name: `Item ${index}`, moduleCode: 'map_tools' }),
    )
    expect(shouldUsePermissionActionTree(many)).toBe(true)
  })
})
