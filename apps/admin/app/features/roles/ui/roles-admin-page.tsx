import { Badge, Button, cn } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import {
  fetchAdminPermissions,
  fetchAdminRoles,
  fetchRolePermissions,
  updateRolePermissions,
  type AdminRoleSummary,
} from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminFormError } from '~/shared/ui/admin-field'

import {
  filterPermissionsForRole,
  PERMISSION_SCOPE_LABELS,
} from '../lib/role-permission-rules'

export function RolesAdminPage() {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:roles:write')
  const queryClient = useQueryClient()

  const rolesQuery = useQuery({ queryKey: adminQueryKeys.roles, queryFn: fetchAdminRoles })
  const permissionsQuery = useQuery({
    queryKey: adminQueryKeys.permissions,
    queryFn: fetchAdminPermissions,
  })

  const [selectedRole, setSelectedRole] = useState<AdminRoleSummary | null>(null)
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  const rolePermissionsQuery = useQuery({
    queryKey: adminQueryKeys.rolePermissions(selectedRole?.id ?? ''),
    queryFn: () => fetchRolePermissions(selectedRole!.id),
    enabled: Boolean(selectedRole),
  })

  useEffect(() => {
    if (!selectedRole && rolesQuery.data?.roles.length) {
      setSelectedRole(rolesQuery.data.roles[0] ?? null)
    }
  }, [rolesQuery.data?.roles, selectedRole])

  useEffect(() => {
    if (rolePermissionsQuery.data) {
      setSelectedCodes(rolePermissionsQuery.data.permissions.map((item) => item.code))
      setFormError(null)
    }
  }, [rolePermissionsQuery.data])

  const availablePermissions = useMemo(() => {
    if (!selectedRole || !permissionsQuery.data) return []
    return filterPermissionsForRole(selectedRole.code, permissionsQuery.data.permissions)
  }, [permissionsQuery.data, selectedRole])

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, typeof availablePermissions>()
    for (const permission of availablePermissions) {
      const bucket = groups.get(permission.scope) ?? []
      bucket.push(permission)
      groups.set(permission.scope, bucket)
    }
    return groups
  }, [availablePermissions])

  const mutation = useMutation({
    mutationFn: (codes: string[]) => updateRolePermissions(selectedRole!.id, codes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.rolePermissions(selectedRole!.id),
      })
      setFormError(null)
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  function togglePermission(code: string) {
    setSelectedCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    )
  }

  function handleSave() {
    if (!selectedRole) return
    mutation.mutate(selectedCodes)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="角色与权限"
        description="为 SaaS 角色配置权限码；保存时将全量替换绑定关系。"
      />

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AdminPanel className="p-2">
          <p className="px-3 py-2 text-xs tracking-[0.14em] text-muted-foreground uppercase">
            角色
          </p>
          {rolesQuery.isLoading ? (
            <AdminEmptyState message="加载中…" />
          ) : (
            <ul className="space-y-1">
              {(rolesQuery.data?.roles ?? []).map((role) => (
                <li key={role.id}>
                  <button
                    type="button"
                    className={cn(
                      'admin-nav-link w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      selectedRole?.id === role.id
                        ? 'bg-primary/12 text-primary'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                    onClick={() => setSelectedRole(role)}
                  >
                    <span className="font-mono">{role.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel className="p-0">
          {!selectedRole ? (
            <AdminEmptyState message="请选择角色" />
          ) : rolePermissionsQuery.isLoading ? (
            <AdminEmptyState message="加载权限…" />
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div>
                  <p className="admin-display text-lg font-semibold">{selectedRole.code}</p>
                  <p className="text-sm text-muted-foreground">
                    已选 {selectedCodes.length} 项权限
                  </p>
                </div>
                {canWrite ? (
                  <Button onClick={handleSave} disabled={mutation.isPending}>
                    {mutation.isPending ? '保存中…' : '保存权限'}
                  </Button>
                ) : null}
              </div>

              <div className="space-y-6 p-5">
                {[...groupedPermissions.entries()].map(([scope, permissions]) => (
                  <section key={scope} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{PERMISSION_SCOPE_LABELS[scope as keyof typeof PERMISSION_SCOPE_LABELS]}</Badge>
                      <span className="text-xs text-muted-foreground">{scope}</span>
                    </div>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {permissions.map((permission) => {
                        const checked = selectedCodes.includes(permission.code)
                        return (
                          <li key={permission.id}>
                            <label
                              className={cn(
                                'flex cursor-pointer gap-3 rounded-lg border px-3 py-3 transition-colors',
                                checked
                                  ? 'border-primary/40 bg-primary/8'
                                  : 'border-border/60 hover:bg-muted/25',
                                !canWrite && 'cursor-default opacity-80',
                              )}
                            >
                              <input
                                type="checkbox"
                                className="mt-0.5"
                                checked={checked}
                                disabled={!canWrite}
                                onChange={() => togglePermission(permission.code)}
                              />
                              <span className="min-w-0">
                                <span className="block font-mono text-xs">{permission.code}</span>
                                <span className="mt-0.5 block text-sm">{permission.name}</span>
                                {permission.description ? (
                                  <span className="mt-1 block text-xs text-muted-foreground">
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

              <div className="border-t border-border/60 px-5 py-4">
                <AdminFormError message={formError} />
              </div>
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  )
}
