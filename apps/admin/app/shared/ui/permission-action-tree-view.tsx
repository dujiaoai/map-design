import { Button, Input } from '@repo/ui'
import type { DataNode } from 'antd/es/tree'
import { SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { AdminAntTree } from '~/shared/ant'
import type { AdminPermission } from '~/shared/api/admin-api'
import {
  buildPermissionActionTree,
  collectPermissionCodes,
  countPermissionTreeNodes,
  filterPermissionsByQuery,
  PERMISSION_TREE_SEARCH_THRESHOLD,
  shouldUsePermissionActionTree,
  type PermissionActionTreeNode,
} from '~/shared/lib/permission-action-tree'

function toAntTreeData(
  nodes: PermissionActionTreeNode[],
  renderPermission: (permission: AdminPermission) => ReactNode,
): DataNode[] {
  return nodes.map((node) => {
    if (node.kind === 'permission') {
      return {
        key: `perm:${node.permission.id}`,
        isLeaf: true,
        selectable: false,
        title: renderPermission(node.permission),
      }
    }

    const childCodes = collectPermissionCodes(node.children)
    return {
      key: node.path,
      title: (
        <span className="inline-flex items-center gap-2 font-mono text-xs">
          <span>{node.segment}</span>
          <span className="font-sans text-muted-foreground">{childCodes.length} 项</span>
        </span>
      ),
      children: toAntTreeData(node.children, renderPermission),
    }
  })
}

function collectGroupPaths(nodes: PermissionActionTreeNode[]): string[] {
  const paths: string[] = []
  function walk(items: PermissionActionTreeNode[]) {
    for (const node of items) {
      if (node.kind !== 'group') continue
      paths.push(node.path)
      walk(node.children)
    }
  }
  walk(nodes)
  return paths
}

export function PermissionActionTreeView({
  permissions,
  moduleCode,
  renderPermission,
  emptyMessage = '无匹配权限项',
  hideSearchBar = false,
  searchQuery,
  onSearchQueryChange,
}: {
  permissions: AdminPermission[]
  moduleCode?: string | null
  renderPermission: (permission: AdminPermission) => ReactNode
  emptyMessage?: string
  hideSearchBar?: boolean
  searchQuery?: string
  onSearchQueryChange?: (value: string) => void
}) {
  const useTree = shouldUsePermissionActionTree(permissions)
  const [internalSearch, setInternalSearch] = useState('')
  const search = searchQuery ?? internalSearch
  const setSearch = onSearchQueryChange ?? setInternalSearch
  const filteredPermissions = useMemo(
    () => filterPermissionsByQuery(permissions, search),
    [permissions, search],
  )
  const tree = useMemo(
    () => buildPermissionActionTree(filteredPermissions, moduleCode),
    [filteredPermissions, moduleCode],
  )
  const treeStats = useMemo(() => countPermissionTreeNodes(tree), [tree])
  const treeData = useMemo(
    () => toAntTreeData(tree, renderPermission),
    [renderPermission, tree],
  )

  const defaultExpandedKeys = useMemo(() => collectGroupPaths(tree), [tree])
  const [expandedKeys, setExpandedKeys] = useState<string[]>(defaultExpandedKeys)

  useEffect(() => {
    if (search.trim()) {
      setExpandedKeys(defaultExpandedKeys)
      return
    }
    setExpandedKeys((current) => {
      const next = current.filter((key) => defaultExpandedKeys.includes(key))
      return next.length > 0 ? next : defaultExpandedKeys
    })
  }, [defaultExpandedKeys, search])

  if (permissions.length === 0) {
    return null
  }

  const showToolbar =
    !hideSearchBar && (useTree || permissions.length >= PERMISSION_TREE_SEARCH_THRESHOLD)

  return (
    <div className="space-y-3">
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索权限码、名称或分组…"
              className="pl-8"
            />
          </div>
          {treeStats.groups > 0 ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={() => setExpandedKeys(defaultExpandedKeys)}
              >
                全部展开
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={() => setExpandedKeys([])}
              >
                全部收起
              </Button>
            </>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {search.trim()
              ? `匹配 ${filteredPermissions.length}/${permissions.length}`
              : `共 ${permissions.length} 项`}
            {treeStats.groups > 0 ? ` · ${treeStats.groups} 个分组` : ''}
          </span>
        </div>
      ) : null}

      {filteredPermissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : useTree && treeStats.groups > 0 ? (
        <AdminAntTree
          showLine
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys as string[])}
        />
      ) : (
        <ul className="space-y-2">
          {filteredPermissions.map((permission) => (
            <li key={permission.id}>{renderPermission(permission)}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
