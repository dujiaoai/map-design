import { Badge, cn } from '@repo/ui'

import type { AdminPermission } from '~/shared/api/admin-api'

import { PERMISSION_SCOPE_LABELS } from '../lib/role-permission-rules'

export function RolePermissionEditor({
  permissions,
  selectedCodes,
  onToggle,
  readOnly = false,
}: {
  permissions: AdminPermission[]
  selectedCodes: string[]
  onToggle: (code: string) => void
  readOnly?: boolean
}) {
  const grouped = new Map<string, AdminPermission[]>()
  for (const permission of permissions) {
    const bucket = grouped.get(permission.scope) ?? []
    bucket.push(permission)
    grouped.set(permission.scope, bucket)
  }

  if (permissions.length === 0) {
    return <p className="text-sm text-muted-foreground">无可选权限</p>
  }

  return (
    <div className="space-y-6">
      {[...grouped.entries()].map(([scope, scopePermissions]) => (
        <section key={scope} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {PERMISSION_SCOPE_LABELS[scope as keyof typeof PERMISSION_SCOPE_LABELS]}
            </Badge>
            <span className="text-xs text-muted-foreground">{scope}</span>
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
                      onChange={() => onToggle(permission.code)}
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
      ))}
    </div>
  )
}
