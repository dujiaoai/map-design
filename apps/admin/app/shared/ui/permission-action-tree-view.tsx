import { Button, Input, cn } from '@repo/ui'
import { ChevronDownIcon, ChevronRightIcon, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

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

function GroupTreeNodes({
  nodes,
  depth,
  expandedPaths,
  onTogglePath,
  renderPermission,
}: {
  nodes: PermissionActionTreeNode[]
  depth: number
  expandedPaths: Set<string>
  onTogglePath: (path: string) => void
  renderPermission: (permission: AdminPermission) => ReactNode
}) {
  return (
    <ul className={cn('space-y-2', depth > 0 && 'ml-4 border-l border-border/50 pl-3')}>
      {nodes.map((node) => {
        if (node.kind === 'permission') {
          return <li key={node.permission.id}>{renderPermission(node.permission)}</li>
        }

        const expanded = expandedPaths.has(node.path)
        const childCodes = collectPermissionCodes(node.children)
        return (
          <li key={node.path} className="space-y-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted/50"
              onClick={() => onTogglePath(node.path)}
            >
              {expanded ? (
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="font-mono text-xs">{node.segment}</span>
              <span className="text-xs text-muted-foreground">{childCodes.length} 项</span>
            </button>
            {expanded ? (
              <GroupTreeNodes
                nodes={node.children}
                depth={depth + 1}
                expandedPaths={expandedPaths}
                onTogglePath={onTogglePath}
                renderPermission={renderPermission}
              />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
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

  const defaultExpandedPaths = useMemo(() => {
    const paths = new Set<string>()
    function walk(nodes: PermissionActionTreeNode[]) {
      for (const node of nodes) {
        if (node.kind !== 'group') continue
        paths.add(node.path)
        walk(node.children)
      }
    }
    walk(tree)
    return paths
  }, [tree])

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(defaultExpandedPaths)

  useEffect(() => {
    if (search.trim()) {
      setExpandedPaths(defaultExpandedPaths)
      return
    }
    setExpandedPaths((current) => {
      const next = new Set<string>()
      for (const path of current) {
        if (defaultExpandedPaths.has(path)) next.add(path)
      }
      if (next.size === 0) return defaultExpandedPaths
      return next
    })
  }, [defaultExpandedPaths, search])

  function togglePath(path: string) {
    setExpandedPaths((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

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
                onClick={() => setExpandedPaths(defaultExpandedPaths)}
              >
                全部展开
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={() => setExpandedPaths(new Set())}
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
        <GroupTreeNodes
          nodes={tree}
          depth={0}
          expandedPaths={expandedPaths}
          onTogglePath={togglePath}
          renderPermission={renderPermission}
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
