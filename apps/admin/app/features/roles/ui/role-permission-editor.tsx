import { Badge, Button, Checkbox, cn, Input } from '@repo/ui'
import { SearchIcon } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import type { AdminPermission } from '~/shared/api/admin-api'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import {
  filterPermissionsByQuery,
  PERMISSION_TREE_SEARCH_THRESHOLD,
} from '~/shared/lib/permission-action-tree'
import { PermissionActionTreeView } from '~/shared/ui/permission-action-tree-view'

import { PERMISSION_SCOPE_LABELS } from '../lib/role-permission-rules'
import { setScopePermissionCodes, togglePermissionCode } from '../lib/role-permission-selection'
import { RolePermissionTransferView } from './role-permission-transfer-view'

const PERMISSION_TRANSFER_VIEW_THRESHOLD = 12

type PermissionEditorView = 'grouped' | 'transfer'

function permissionGroupKey(permission: AdminPermission) {
  if (permission.moduleCode || permission.moduleName) {
    return `module:${permission.moduleCode ?? permission.moduleName}`
  }
  return `scope:${permission.scope}`
}

function permissionGroupLabel(permission: AdminPermission) {
  if (permission.moduleName) return permission.moduleName
  if (permission.moduleCode) return permission.moduleCode
  return PERMISSION_SCOPE_LABELS[permission.scope]
}

export function RolePermissionEditor({
  permissions,
  selectedCodes,
  onSelectedCodesChange,
  readOnly = false,
}: {
  permissions: AdminPermission[]
  selectedCodes: string[]
  onSelectedCodesChange: (codes: string[]) => void
  readOnly?: boolean
}) {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<PermissionEditorView>('grouped')
  const searchInputRef = useRef<HTMLInputElement>(null)
  useAdminListSearchShortcut(searchInputRef)
  const visiblePermissions = useMemo(
    () => filterPermissionsByQuery(permissions, search),
    [permissions, search],
  )

  const grouped = new Map<string, AdminPermission[]>()
  for (const permission of visiblePermissions) {
    const key = permissionGroupKey(permission)
    const bucket = grouped.get(key) ?? []
    bucket.push(permission)
    grouped.set(key, bucket)
  }

  const permissionByCode = new Map(permissions.map((permission) => [permission.code, permission]))

  if (permissions.length === 0) {
    return <p className="text-sm text-muted-foreground">无可选权限</p>
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
        <p className="text-sm font-medium">
          权限集合
          <span className="ml-2 font-normal text-muted-foreground">
            已选 {selectedCodes.length} / {permissions.length} 项
          </span>
        </p>
        {selectedCodes.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">勾选下方权限组成该角色的能力集合，可多选。</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedCodes.map((code) => (
              <Badge key={code} variant="secondary" className="font-mono text-[10px]">
                {permissionByCode.get(code)?.name ?? code}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {!readOnly && permissions.length >= PERMISSION_TRANSFER_VIEW_THRESHOLD ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={view === 'grouped' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setView('grouped')}
          >
            分组视图
          </Button>
          <Button
            type="button"
            variant={view === 'transfer' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setView('transfer')}
          >
            穿梭框
          </Button>
        </div>
      ) : null}

      {view === 'transfer' ? (
        <RolePermissionTransferView
          permissions={permissions}
          selectedCodes={selectedCodes}
          onSelectedCodesChange={onSelectedCodesChange}
          readOnly={readOnly}
        />
      ) : (
        <>
          {permissions.length >= PERMISSION_TREE_SEARCH_THRESHOLD ? (
            <div className="relative max-w-md">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                ref={searchInputRef}
                type="search"
                role="searchbox"
                aria-label="搜索权限码、名称或分组"
                aria-keyshortcuts="/"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索权限码、名称或分组…"
                className={cn('pl-8', search ? 'pr-9' : 'pr-14')}
              />
              {!search ? (
                <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-border/70 bg-muted/30 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                  /
                </kbd>
              ) : null}
            </div>
          ) : null}

          {visiblePermissions.length === 0 ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm text-muted-foreground">无匹配权限</p>
              {search.trim() ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setSearch('')}>
                  清除搜索
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              {[...grouped.entries()].map(([groupKey, groupPermissions]) => {
                const sample = groupPermissions[0]!
                const groupCodes = groupPermissions.map((permission) => permission.code)
                const selectedInGroup = groupCodes.filter((code) => selectedCodes.includes(code)).length
                const allSelected = selectedInGroup === groupCodes.length
                const isModuleGroup = groupKey.startsWith('module:')

                return (
                  <section key={groupKey} className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{permissionGroupLabel(sample)}</Badge>
                        {isModuleGroup ? (
                          <span className="font-mono text-xs text-muted-foreground">
                            {sample.moduleCode}
                          </span>
                        ) : null}
                        <Badge variant="secondary" className="text-[10px]">
                          {PERMISSION_SCOPE_LABELS[sample.scope]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {selectedInGroup}/{groupCodes.length}
                        </span>
                      </div>
                      {!readOnly ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() =>
                              onSelectedCodesChange(
                                setScopePermissionCodes(selectedCodes, groupCodes, !allSelected),
                              )
                            }
                          >
                            {allSelected ? '清空本组' : '全选本组'}
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    <PermissionActionTreeView
                      permissions={groupPermissions}
                      moduleCode={sample.moduleCode}
                      hideSearchBar
                      searchQuery={search}
                      emptyMessage="本模块无匹配权限"
                      renderPermission={(permission) => {
                        const checked = selectedCodes.includes(permission.code)
                        return (
                          <label
                            className={cn(
                              'flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3 transition-colors',
                              checked ? 'border-primary/40 bg-primary/8' : 'hover:bg-muted/40',
                              readOnly && 'cursor-default opacity-80',
                            )}
                          >
                            <Checkbox
                              className="mt-0.5"
                              checked={checked}
                              disabled={readOnly}
                              onCheckedChange={() =>
                                onSelectedCodesChange(
                                  togglePermissionCode(selectedCodes, permission.code),
                                )
                              }
                            />
                            <span className="min-w-0">
                              <span className="block font-mono text-xs">{permission.code}</span>
                              <span className="block text-sm text-foreground">{permission.name}</span>
                              {permission.description ? (
                                <span className="block text-xs text-muted-foreground">
                                  {permission.description}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        )
                      }}
                    />
                  </section>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
