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
import { Button, cn, useConfirmDialog } from '@repo/ui'

import { filterPermissionsForRole } from '../lib/role-permission-rules'
import { RolePermissionEditor } from './role-permission-editor'

export function RolesAdminPage() {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:roles:write')
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()

  const rolesQuery = useQuery({ queryKey: adminQueryKeys.roles, queryFn: fetchAdminRoles })
  const permissionsQuery = useQuery({
    queryKey: adminQueryKeys.permissions,
    queryFn: fetchAdminPermissions,
  })

  const [selectedRole, setSelectedRole] = useState<AdminRoleSummary | null>(null)
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)

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

  const savedCodes = useMemo(
    () => [...(rolePermissionsQuery.data?.permissions.map((item) => item.code) ?? [])].sort(),
    [rolePermissionsQuery.data?.permissions],
  )
  const isDirty = useMemo(() => {
    const current = [...selectedCodes].sort()
    return current.join('|') !== savedCodes.join('|')
  }, [savedCodes, selectedCodes])

  const mutation = useMutation({
    mutationFn: (codes: string[]) => updateRolePermissions(selectedRole!.id, codes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.rolePermissions(selectedRole!.id),
      })
      setFormError(null)
      setSaveNotice('权限已保存。持有该角色的用户需重新登录后生效。')
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  async function selectRole(role: AdminRoleSummary) {
    if (
      isDirty &&
      selectedRole &&
      !(await confirm('当前角色权限未保存，确定切换？'))
    ) {
      return
    }
    setSelectedRole(role)
    setSaveNotice(null)
  }

  function handleSave() {
    if (!selectedRole) return
    mutation.mutate(selectedCodes)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="RBAC"
        title="角色与权限"
        description="每个角色可绑定多项权限码，保存时全量替换权限集合。"
      />
      {saveNotice ? (
        <p className="rounded-lg border border-primary/30 bg-primary/8 px-4 py-3 text-sm text-primary">
          {saveNotice}
        </p>
      ) : null}

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
                    onClick={() => selectRole(role)}
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
                    权限集合 {selectedCodes.length} 项
                    {isDirty ? ' · 有未保存更改' : ''}
                  </p>
                </div>
                {canWrite ? (
                  <Button onClick={handleSave} disabled={mutation.isPending}>
                    {mutation.isPending ? '保存中…' : '保存权限集合'}
                  </Button>
                ) : null}
              </div>

              <div className="p-5">
                <RolePermissionEditor
                  permissions={availablePermissions}
                  selectedCodes={selectedCodes}
                  onSelectedCodesChange={setSelectedCodes}
                  readOnly={!canWrite}
                />
              </div>

              <div className="border-t border-border/60 px-5 py-4">
                <AdminFormError message={formError} />
              </div>
            </div>
          )}
        </AdminPanel>
      </div>
      {confirmDialog}
    </div>
  )
}
