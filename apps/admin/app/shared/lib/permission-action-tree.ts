import type { AdminPermission } from '~/shared/api/admin-api'

export const PERMISSION_TREE_SEARCH_THRESHOLD = 8

export type PermissionActionTreeNode =
  | {
      kind: 'group'
      segment: string
      path: string
      children: PermissionActionTreeNode[]
    }
  | { kind: 'permission'; permission: AdminPermission }

type MutableGroup = {
  kind: 'group'
  segment: string
  path: string
  children: Map<string, MutableGroup>
  permissions: AdminPermission[]
}

export function moduleCodeToPrefixCandidates(moduleCode: string): string[] {
  return [`${moduleCode}:`, `${moduleCode.replace(/_/g, ':')}:`]
}

export function stripModulePrefix(code: string, moduleCode?: string | null): string {
  if (!moduleCode) return code
  for (const prefix of moduleCodeToPrefixCandidates(moduleCode)) {
    if (code.startsWith(prefix)) return code.slice(prefix.length)
  }
  return code
}

export function resolvePermissionGroupSegments(
  permission: AdminPermission,
  moduleCode?: string | null,
): string[] {
  const relative = stripModulePrefix(
    permission.code,
    moduleCode ?? permission.moduleCode,
  )
  const parts = relative.split(':').filter(Boolean)
  if (parts.length <= 1) return []
  return parts.slice(0, -1)
}

export function filterPermissionsByQuery(
  permissions: AdminPermission[],
  query: string,
): AdminPermission[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return permissions
  return permissions.filter((permission) => {
    const haystack = [
      permission.code,
      permission.name,
      permission.description ?? '',
      resolvePermissionGroupSegments(permission, permission.moduleCode).join(':'),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalized)
  })
}

function compareNodes(a: PermissionActionTreeNode, b: PermissionActionTreeNode): number {
  if (a.kind === 'group' && b.kind === 'group') {
    return a.segment.localeCompare(b.segment, 'zh-CN')
  }
  if (a.kind === 'permission' && b.kind === 'permission') {
    return a.permission.code.localeCompare(b.permission.code, 'zh-CN')
  }
  return a.kind === 'group' ? -1 : 1
}

function finalizeGroup(group: MutableGroup): PermissionActionTreeNode[] {
  const nodes: PermissionActionTreeNode[] = []

  for (const child of [...group.children.values()].sort((left, right) =>
    left.segment.localeCompare(right.segment, 'zh-CN'),
  )) {
    nodes.push({
      kind: 'group',
      segment: child.segment,
      path: child.path,
      children: finalizeGroup(child),
    })
  }

  for (const permission of [...group.permissions].sort((left, right) =>
    left.code.localeCompare(right.code, 'zh-CN'),
  )) {
    nodes.push({ kind: 'permission', permission })
  }

  return nodes.sort(compareNodes)
}

export function buildPermissionActionTree(
  permissions: AdminPermission[],
  moduleCode?: string | null,
): PermissionActionTreeNode[] {
  const root: MutableGroup = {
    kind: 'group',
    segment: '',
    path: '',
    children: new Map(),
    permissions: [],
  }

  for (const permission of permissions) {
    const groupSegments = resolvePermissionGroupSegments(permission, moduleCode)
    let cursor = root

    for (const [index, segment] of groupSegments.entries()) {
      const path = groupSegments.slice(0, index + 1).join('/')
      const existing = cursor.children.get(segment)
      if (existing) {
        cursor = existing
        continue
      }
      const created: MutableGroup = {
        kind: 'group',
        segment,
        path,
        children: new Map(),
        permissions: [],
      }
      cursor.children.set(segment, created)
      cursor = created
    }

    cursor.permissions.push(permission)
  }

  return finalizeGroup(root)
}

export function collectPermissionCodes(nodes: PermissionActionTreeNode[]): string[] {
  const codes: string[] = []
  for (const node of nodes) {
    if (node.kind === 'permission') {
      codes.push(node.permission.code)
      continue
    }
    codes.push(...collectPermissionCodes(node.children))
  }
  return codes
}

export function countPermissionTreeNodes(nodes: PermissionActionTreeNode[]): {
  groups: number
  permissions: number
} {
  let groups = 0
  let permissions = 0
  for (const node of nodes) {
    if (node.kind === 'permission') {
      permissions += 1
      continue
    }
    groups += 1
    const nested = countPermissionTreeNodes(node.children)
    groups += nested.groups
    permissions += nested.permissions
  }
  return { groups, permissions }
}

export function shouldUsePermissionActionTree(permissions: AdminPermission[]): boolean {
  if (permissions.length >= PERMISSION_TREE_SEARCH_THRESHOLD) return true
  return permissions.some(
    (permission) => resolvePermissionGroupSegments(permission, permission.moduleCode).length > 0,
  )
}
