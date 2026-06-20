import { Badge, Button, cn, Input, toast, useConfirmDialog } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { PencilIcon, SearchIcon, Trash2Icon, UsersIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { CreateTenantRoleSheet } from '~/features/roles/ui/create-tenant-role-sheet'
import { EditTenantRoleSheet } from '~/features/roles/ui/edit-tenant-role-sheet'
import { TenantRolesGuidanceStrip } from '~/features/roles/ui/tenant-roles-guidance-strip'
import {
  deleteTenantCustomRole,
  fetchTenantAssignablePermissions,
  fetchTenantCustomRoles,
  fetchTenantRolePermissions,
  type TenantRoleSummary,
  updateTenantRolePermissions,
} from '~/shared/api/admin-api'
import { isPlatformAdmin } from '~/shared/auth/admin-access'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminFormError } from '~/shared/ui/admin-field'
import {
  AdminRbacEditorSkeleton,
  AdminSidebarListSkeleton,
} from '~/shared/ui/admin-table-skeleton'

import { RolePermissionEditor } from './role-permission-editor'

export function TenantCustomRolesPanel({
  tenantId,
  tenantLabel,
  embedded = false,
}: {
  tenantId: string
  tenantLabel?: string
  embedded?: boolean
}) {
  const { can, session } = useAdminPermissions()
  const canWrite =
    isPlatformAdmin(session) || can('admin:members:write') || can('admin:tenants:write')
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()
  const searchInputRef = useRef<HTMLInputElement>(null)
  useAdminListSearchShortcut(searchInputRef)

  const rolesQuery = useQuery({
    queryKey: adminQueryKeys.tenantCustomRoles(tenantId),
    queryFn: () => fetchTenantCustomRoles(tenantId),
  })
  const permissionsQuery = useQuery({
    queryKey: adminQueryKeys.tenantAssignablePermissions(tenantId),
    queryFn: () => fetchTenantAssignablePermissions(tenantId),
  })

  const [selectedRole, setSelectedRole] = useState<TenantRoleSummary | null>(null)
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [roleSearch, setRoleSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const rolePermissionsQuery = useQuery({
    queryKey: adminQueryKeys.tenantRolePermissions(tenantId, selectedRole?.id ?? ''),
    queryFn: () => fetchTenantRolePermissions(tenantId, selectedRole!.id),
    enabled: Boolean(selectedRole),
  })

  const roles = rolesQuery.data?.roles ?? []
  const customRoleCount = roles.filter((role) => !role.system).length

  const filteredRoles = useMemo(() => {
    const query = roleSearch.trim().toLowerCase()
    if (!query) return roles
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) || role.code.toLowerCase().includes(query),
    )
  }, [roleSearch, roles])

  useEffect(() => {
    if (!selectedRole && roles.length) {
      setSelectedRole(roles[0] ?? null)
    }
  }, [roles, selectedRole])

  useEffect(() => {
    if (!selectedRole) return
    const updated = roles.find((role) => role.id === selectedRole.id)
    if (updated) setSelectedRole(updated)
  }, [roles, selectedRole?.id])

  useEffect(() => {
    if (rolePermissionsQuery.data) {
      setSelectedCodes(rolePermissionsQuery.data.permissions.map((item) => item.code))
      setFormError(null)
    }
  }, [rolePermissionsQuery.data])

  const availablePermissions = useMemo(() => {
    return permissionsQuery.data?.permissions ?? []
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
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.assignableRoles(tenantId) }),
      ])
      setFormError(null)
      toast.success('权限已保存', {
        description: '持有该角色的成员需重新登录后生效。',
      })
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => deleteTenantCustomRole(tenantId, roleId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantCustomRoles(tenantId) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.assignableRoles(tenantId) }),
      ])
      setSelectedRole(null)
      toast.success('自定义角色已删除')
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  async function selectRole(role: TenantRoleSummary) {
    if (selectedRole?.id === role.id) return
    if (
      isDirty &&
      selectedRole &&
      !(await confirm({
        title: '放弃未保存更改',
        description: '当前角色权限未保存，确定切换？',
        confirmLabel: '切换角色',
      }))
    ) {
      return
    }
    setSelectedRole(role)
  }

  const deleteDisabledReason = selectedRole
    ? selectedRole.system
      ? '系统内置角色不可删除'
      : selectedRole.memberCount > 0
        ? `仍有 ${selectedRole.memberCount} 名成员持有此角色`
        : null
    : null

  const content = (
    <>
      {tenantLabel ? (
        <TenantRolesGuidanceStrip
          tenantId={tenantId}
          tenantLabel={tenantLabel}
          total={customRoleCount}
          loaded={Boolean(rolesQuery.data)}
          embedded={embedded}
          canWrite={canWrite}
          onCreate={() => setCreateOpen(true)}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <AdminPanel className="flex flex-col p-2">
          <div className="space-y-2 px-2 pb-2">
            <p className="admin-display text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              角色列表
            </p>
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                ref={searchInputRef}
                value={roleSearch}
                onChange={(event) => setRoleSearch(event.target.value)}
                placeholder="搜索角色名或 code…"
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          {rolesQuery.isLoading ? (
            <AdminSidebarListSkeleton />
          ) : rolesQuery.isError ? (
            <AdminEmptyState
              message="加载自定义角色失败，请刷新重试"
              onRetry={() => void rolesQuery.refetch()}
              isRetrying={rolesQuery.isFetching}
            />
          ) : !roles.length ? (
            <AdminEmptyState
              message="暂无角色"
              action={
                canWrite ? (
                  <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                    创建首个角色
                  </Button>
                ) : undefined
              }
            />
          ) : !filteredRoles.length ? (
            <AdminEmptyState
              message="无匹配角色"
              action={
                <Button type="button" variant="outline" size="sm" onClick={() => setRoleSearch('')}>
                  清除搜索
                </Button>
              }
            />
          ) : (
            <ul className="admin-scroll-area -mr-1 min-h-0 flex-1 space-y-1 pr-1">
              {filteredRoles.map((role) => {
                const active = selectedRole?.id === role.id
                return (
                  <li key={role.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      className={cn(
                        'w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
                        active
                          ? 'border-primary/40 bg-primary/12 text-primary shadow-sm'
                          : 'border-transparent text-muted-foreground hover:border-border/50 hover:bg-muted/40 hover:text-foreground',
                      )}
                      onClick={() => void selectRole(role)}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="block truncate font-medium">{role.name}</span>
                        {role.system ? (
                          <Badge variant="secondary" className="shrink-0 text-[9px]">
                            系统
                          </Badge>
                        ) : null}
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2 font-mono text-[10px] opacity-80">
                        <span className="truncate">{role.code}</span>
                        <span className="shrink-0 tabular-nums">{role.memberCount}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel className="p-0">
          {!selectedRole ? (
            <AdminEmptyState
              message="请选择或创建自定义角色"
              action={
                canWrite ? (
                  <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                    新建角色
                  </Button>
                ) : undefined
              }
            />
          ) : rolePermissionsQuery.isLoading ? (
            <AdminRbacEditorSkeleton />
          ) : rolePermissionsQuery.isError ? (
            <AdminEmptyState
              message="加载角色权限失败，请刷新重试"
              onRetry={() => void rolePermissionsQuery.refetch()}
              isRetrying={rolePermissionsQuery.isFetching}
            />
          ) : permissionsQuery.isError ? (
            <AdminEmptyState
              message="加载可分配权限失败，请刷新重试"
              onRetry={() => void permissionsQuery.refetch()}
              isRetrying={permissionsQuery.isFetching}
            />
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div className="min-w-0">
                  <p className="admin-display text-lg font-semibold">{selectedRole.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {selectedRole.code}
                    </Badge>
                    <span>{selectedRole.permissionCount} 项权限</span>
                    <span>·</span>
                    {selectedRole.memberCount > 0 ? (
                      <Link
                        to={`/members?tenantId=${encodeURIComponent(tenantId)}`}
                        className="inline-flex items-center gap-1 text-primary transition-colors hover:underline"
                      >
                        <UsersIcon className="size-3" aria-hidden />
                        {selectedRole.memberCount} 名成员
                      </Link>
                    ) : (
                      <span>0 名成员</span>
                    )}
                    {isDirty ? (
                      <>
                        <span>·</span>
                        <span className="text-amber-600 dark:text-amber-400">有未保存更改</span>
                      </>
                    ) : null}
                  </p>
                  {selectedRole.description ? (
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {selectedRole.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {canWrite ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditOpen(true)}
                        disabled={selectedRole.system}
                        title={selectedRole.system ? '系统内置角色不可编辑' : '编辑名称与描述'}
                      >
                        <PencilIcon className="size-3.5" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          deleteMutation.isPending ||
                          Boolean(deleteDisabledReason)
                        }
                        title={deleteDisabledReason ?? '删除此自定义角色'}
                        onClick={async () => {
                          const confirmed = await confirm({
                            description: `确定删除角色 ${selectedRole.name}？此操作不可撤销。`,
                            confirmLabel: '删除',
                            destructive: true,
                          })
                          if (!confirmed) return
                          deleteMutation.mutate(selectedRole.id)
                        }}
                      >
                        <Trash2Icon className="size-3.5" />
                        删除
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => saveMutation.mutate(selectedCodes)}
                        disabled={saveMutation.isPending || !isDirty}
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
                  onSelectedCodesChange={setSelectedCodes}
                  readOnly={!canWrite}
                />
                <AdminFormError message={formError} />
              </div>
            </div>
          )}
        </AdminPanel>
      </div>

      <CreateTenantRoleSheet
        tenantId={tenantId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(role) => setSelectedRole(role)}
      />
      <EditTenantRoleSheet
        tenantId={tenantId}
        role={selectedRole}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      {confirmDialog}
    </>
  )

  if (embedded) {
    return <div className="space-y-4">{content}</div>
  }

  return <div className="space-y-6">{content}</div>
}
