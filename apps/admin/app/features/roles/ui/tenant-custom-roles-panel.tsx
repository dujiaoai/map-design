import { Badge, Button, Input } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  createTenantCustomRole,
  deleteTenantCustomRole,
  fetchAdminPermissions,
  fetchTenantCustomRoles,
  fetchTenantRolePermissions,
  type TenantRoleSummary,
  updateTenantRolePermissions,
} from '~/shared/api/admin-api'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminFormError } from '~/shared/ui/admin-field'

import { filterPermissionsForCustomRole } from '../lib/role-permission-rules'
import { RolePermissionEditor } from './role-permission-editor'

export function TenantCustomRolesPanel({ tenantId }: { tenantId: string }) {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:members:write') || can('admin:tenants:write')
  const queryClient = useQueryClient()

  const rolesQuery = useQuery({
    queryKey: adminQueryKeys.tenantCustomRoles(tenantId),
    queryFn: () => fetchTenantCustomRoles(tenantId),
  })
  const permissionsQuery = useQuery({
    queryKey: adminQueryKeys.permissions,
    queryFn: fetchAdminPermissions,
  })

  const [selectedRole, setSelectedRole] = useState<TenantRoleSummary | null>(null)
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createCode, setCreateCode] = useState('')
  const [createName, setCreateName] = useState('')

  const rolePermissionsQuery = useQuery({
    queryKey: adminQueryKeys.tenantRolePermissions(tenantId, selectedRole?.id ?? ''),
    queryFn: () => fetchTenantRolePermissions(tenantId, selectedRole!.id),
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
    if (!permissionsQuery.data) return []
    return filterPermissionsForCustomRole(permissionsQuery.data.permissions)
  }, [permissionsQuery.data])

  const savedCodes = useMemo(
    () => [...(rolePermissionsQuery.data?.permissions.map((item) => item.code) ?? [])].sort(),
    [rolePermissionsQuery.data?.permissions],
  )
  const isDirty = useMemo(() => {
    const current = [...selectedCodes].sort()
    return current.join('|') !== savedCodes.join('|')
  }, [savedCodes, selectedCodes])

  const saveMutation = useMutation({
    mutationFn: (codes: string[]) =>
      updateTenantRolePermissions(tenantId, selectedRole!.id, codes),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminQueryKeys.tenantRolePermissions(tenantId, selectedRole!.id),
        }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantCustomRoles(tenantId) }),
      ])
      setFormError(null)
      setSaveNotice('权限已保存。持有该角色的成员需重新登录后生效。')
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createTenantCustomRole(tenantId, {
        code: createCode.trim(),
        name: createName.trim(),
        permissionCodes: [],
      }),
    onSuccess: async (role) => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantCustomRoles(tenantId) })
      setCreateOpen(false)
      setCreateCode('')
      setCreateName('')
      setSelectedRole(role)
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => deleteTenantCustomRole(tenantId, roleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantCustomRoles(tenantId) })
      setSelectedRole(null)
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  function togglePermission(code: string) {
    setSelectedCodes((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          为本租户创建自定义角色，并配置 tenant / workspace 范围权限。
        </p>
        {canWrite ? (
          <Button variant="outline" size="sm" onClick={() => setCreateOpen((open) => !open)}>
            <PlusIcon className="size-3.5" />
            新建角色
          </Button>
        ) : null}
      </div>

      {createOpen ? (
        <AdminPanel className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">角色码</span>
            <Input
              value={createCode}
              onChange={(event) => setCreateCode(event.target.value)}
              placeholder="map_editor"
              className="font-mono"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">显示名</span>
            <Input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder="地图编辑员"
            />
          </label>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={
              !createCode.trim() || !createName.trim() || createMutation.isPending
            }
          >
            创建
          </Button>
        </AdminPanel>
      ) : null}

      {saveNotice ? (
        <p className="rounded-lg border border-primary/30 bg-primary/8 px-4 py-3 text-sm text-primary">
          {saveNotice}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AdminPanel className="p-2">
          {rolesQuery.isLoading ? (
            <AdminEmptyState message="加载中…" />
          ) : !rolesQuery.data?.roles.length ? (
            <AdminEmptyState message="暂无自定义角色" />
          ) : (
            <ul className="space-y-1">
              {rolesQuery.data.roles.map((role) => (
                <li key={role.id}>
                  <button
                    type="button"
                    className={`admin-nav-link w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      selectedRole?.id === role.id
                        ? 'bg-primary/12 text-primary'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    }`}
                    onClick={() => {
                      setSelectedRole(role)
                      setSaveNotice(null)
                    }}
                  >
                    <span className="block font-medium">{role.name}</span>
                    <span className="font-mono text-xs opacity-80">{role.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel className="p-0">
          {!selectedRole ? (
            <AdminEmptyState message="请选择或创建自定义角色" />
          ) : rolePermissionsQuery.isLoading ? (
            <AdminEmptyState message="加载权限…" />
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div>
                  <p className="admin-display text-lg font-semibold">{selectedRole.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <Badge variant="outline" className="mr-2 font-mono text-[10px]">
                      {selectedRole.code}
                    </Badge>
                    {selectedRole.permissionCount} 项权限 · {selectedRole.memberCount} 名成员
                    {isDirty ? ' · 有未保存更改' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  {canWrite ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deleteMutation.isPending || selectedRole.memberCount > 0}
                        onClick={() => {
                          if (!window.confirm(`确定删除角色 ${selectedRole.name}？`)) return
                          deleteMutation.mutate(selectedRole.id)
                        }}
                      >
                        <Trash2Icon className="size-3.5" />
                        删除
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveMutation.mutate(selectedCodes)}
                        disabled={saveMutation.isPending}
                      >
                        {saveMutation.isPending ? '保存中…' : '保存权限'}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="p-5">
                <RolePermissionEditor
                  permissions={availablePermissions}
                  selectedCodes={selectedCodes}
                  onToggle={togglePermission}
                  readOnly={!canWrite}
                />
                <AdminFormError message={formError} />
              </div>
            </div>
          )}
        </AdminPanel>
      </div>
    </div>
  )
}
