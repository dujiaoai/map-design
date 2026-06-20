import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Button, cn, Input, toast, useConfirmDialog } from '@repo/ui'
import { KeyRoundIcon, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import {
  describeSystemRole,
  formatSystemRoleLabel,
  getSystemRoleScope,
  SYSTEM_ROLE_SCOPE_LABELS,
  systemRoleInitials,
} from '~/features/roles/lib/system-role-labels'
import { filterPermissionsForRole } from '~/features/roles/lib/role-permission-rules'
import { RolePermissionEditor } from '~/features/roles/ui/role-permission-editor'
import {
  matchesSystemRoleScopeFilter,
  SystemRolesScopeFilter,
} from '~/features/roles/ui/system-roles-scope-filter'
import { SystemRolesGuidanceStrip } from '~/features/roles/ui/system-roles-guidance-strip'
import {
  fetchAdminPermissions,
  fetchAdminRoles,
  fetchRolePermissions,
  updateRolePermissions,
  type AdminRoleSummary,
} from '~/shared/api/admin-api'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import {
  buildRbacAdminCrossLink,
  resolveRbacAdminBackLink,
} from '~/shared/lib/rbac-admin-nav'
import { AdminEmptyState, AdminPageBackButton, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminFormError } from '~/shared/ui/admin-field'
import {
  AdminRbacEditorSkeleton,
  AdminSidebarListSkeleton,
} from '~/shared/ui/admin-table-skeleton'

export function RolesAdminPage() {
  const { can, session } = useAdminPermissions()
  const canWrite = can('admin:roles:write')
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()
  const [searchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  useAdminListSearchShortcut(searchInputRef)

  const backLink = resolveRbacAdminBackLink(searchParams)
  const permissionsHref = buildRbacAdminCrossLink('permissions', 'roles', searchParams)
  const tenantRolesHref = buildRbacAdminCrossLink('tenant-roles', 'roles', searchParams, {
    tenantId: session?.tenant?.id,
  })

  const rolesQuery = useQuery({ queryKey: adminQueryKeys.roles, queryFn: fetchAdminRoles })
  const permissionsQuery = useQuery({
    queryKey: adminQueryKeys.permissions,
    queryFn: fetchAdminPermissions,
  })

  const [selectedRole, setSelectedRole] = useState<AdminRoleSummary | null>(null)
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [roleSearch, setRoleSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState('all')
  const initialRoleAppliedRef = useRef(false)
  const initialRoleCode = searchParams.get('role') ?? undefined

  const rolePermissionsQuery = useQuery({
    queryKey: adminQueryKeys.rolePermissions(selectedRole?.id ?? ''),
    queryFn: () => fetchRolePermissions(selectedRole!.id),
    enabled: Boolean(selectedRole),
  })

  const roles = rolesQuery.data?.roles ?? []

  const filteredRoles = useMemo(() => {
    const query = roleSearch.trim().toLowerCase()
    return roles.filter((role) => {
      if (!matchesSystemRoleScopeFilter(role.code, scopeFilter, getSystemRoleScope)) {
        return false
      }
      if (!query) return true
      const label = formatSystemRoleLabel(role.code, role.name).toLowerCase()
      return label.includes(query) || role.code.toLowerCase().includes(query)
    })
  }, [roleSearch, roles, scopeFilter])

  useEffect(() => {
    if (!roles.length) return
    if (!initialRoleAppliedRef.current) {
      if (initialRoleCode) {
        const matched = roles.find((role) => role.code === initialRoleCode)
        if (matched) {
          setSelectedRole(matched)
          initialRoleAppliedRef.current = true
          return
        }
      }
      if (!selectedRole) {
        setSelectedRole(roles[0] ?? null)
      }
      initialRoleAppliedRef.current = true
    }
  }, [initialRoleCode, roles, selectedRole])

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
      toast.success('权限已保存', {
        description: '持有该角色的用户需重新登录后生效。',
      })
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  async function selectRole(role: AdminRoleSummary) {
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

  const selectedScope = selectedRole ? getSystemRoleScope(selectedRole.code) : null

  return (
    <div className="space-y-6 admin-stagger">
      <AdminPageBackButton backLink={backLink} />

      <SystemRolesGuidanceStrip
        total={roles.length}
        loaded={Boolean(rolesQuery.data)}
        permissionsHref={permissionsHref}
        tenantRolesHref={tenantRolesHref}
      />

      <section className="space-y-3">
        <h2 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
          作用域筛选
        </h2>
        <SystemRolesScopeFilter value={scopeFilter} onChange={setScopeFilter} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <AdminPanel className="flex flex-col p-2">
          <div className="space-y-2 px-2 pb-2">
            <p className="admin-display text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              系统角色
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
              message="加载角色失败，请刷新重试"
              onRetry={() => void rolesQuery.refetch()}
              isRetrying={rolesQuery.isFetching}
            />
          ) : !roles.length ? (
            <AdminEmptyState message="暂无系统角色" />
          ) : !filteredRoles.length ? (
            <AdminEmptyState
              message="无匹配角色"
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRoleSearch('')
                    setScopeFilter('all')
                  }}
                >
                  清除筛选
                </Button>
              }
            />
          ) : (
            <ul className="admin-scroll-area -mr-1 min-h-0 flex-1 space-y-1 pr-1">
              {filteredRoles.map((role) => {
                const active = selectedRole?.id === role.id
                const scope = getSystemRoleScope(role.code)
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
                        <span className="block truncate font-medium">
                          {formatSystemRoleLabel(role.code, role.name)}
                        </span>
                        {scope ? (
                          <Badge variant="secondary" className="shrink-0 text-[9px]">
                            {SYSTEM_ROLE_SCOPE_LABELS[scope]}
                          </Badge>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] opacity-80">
                        {role.code}
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
            <AdminEmptyState message="请选择系统角色" />
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
              message="加载权限目录失败，请刷新重试"
              onRetry={() => void permissionsQuery.refetch()}
              isRetrying={permissionsQuery.isFetching}
            />
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div className="flex min-w-0 flex-1 gap-3">
                  <span
                    className="admin-tenant-avatar flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-sm font-semibold text-primary"
                    aria-hidden
                  >
                    {systemRoleInitials(selectedRole.code, selectedRole.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="admin-display text-lg font-semibold">
                      {formatSystemRoleLabel(selectedRole.code, selectedRole.name)}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {selectedRole.code}
                      </Badge>
                      {selectedScope ? (
                        <span>{SYSTEM_ROLE_SCOPE_LABELS[selectedScope]}权限</span>
                      ) : null}
                      <span>·</span>
                      <span>{selectedCodes.length} 项已选</span>
                      {isDirty ? (
                        <>
                          <span>·</span>
                          <span className="text-amber-600 dark:text-amber-400">有未保存更改</span>
                        </>
                      ) : null}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {describeSystemRole(selectedRole.code)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    render={<Link to={permissionsHref} />}
                  >
                    <KeyRoundIcon className="size-3.5" />
                    权限目录
                  </Button>
                  {canWrite ? (
                    <Button
                      size="sm"
                      onClick={() => mutation.mutate(selectedCodes)}
                      disabled={mutation.isPending || !isDirty}
                    >
                      {mutation.isPending ? '保存中…' : '保存权限'}
                    </Button>
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
      {confirmDialog}
    </div>
  )
}
