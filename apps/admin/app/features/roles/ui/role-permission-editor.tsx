import { Badge, Button, cn } from '@repo/ui'

import type { AdminPermission } from '~/shared/api/admin-api'

import { PERMISSION_SCOPE_LABELS } from '../lib/role-permission-rules'
import { setScopePermissionCodes, togglePermissionCode } from '../lib/role-permission-selection'

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
  const grouped = new Map<string, AdminPermission[]>()
  for (const permission of permissions) {
    const bucket = grouped.get(permission.scope) ?? []
    bucket.push(permission)
    grouped.set(permission.scope, bucket)
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

      <div className="space-y-6">
        {[...grouped.entries()].map(([scope, scopePermissions]) => {
          const scopeCodes = scopePermissions.map((permission) => permission.code)
          const selectedInScope = scopeCodes.filter((code) => selectedCodes.includes(code)).length
          const allSelected = selectedInScope === scopeCodes.length

          return (
            <section key={scope} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {PERMISSION_SCOPE_LABELS[scope as keyof typeof PERMISSION_SCOPE_LABELS]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {scope} · {selectedInScope}/{scopeCodes.length}
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
                          setScopePermissionCodes(selectedCodes, scopeCodes, !allSelected),
                        )
                      }
                    >
                      {allSelected ? '清空本组' : '全选本组'}
                    </Button>
                  </div>
                ) : null}
              </div>
              <ul className="grid gap-2 md:grid-cols-2">
                {scopePermissions.map((permission) => {
                  const checked = selectedCodes.includes(permission.code)
                  return (
                    <li key={permission.id}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 p-3 transition-colors',
                          checked ? 'border-primary/40 bg-primary/8' : 'hover:bg-muted/40',
                          readOnly && 'cursor-default opacity-80',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 size-4 rounded border-border"
                          checked={checked}
                          disabled={readOnly}
                          onChange={() =>
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
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
