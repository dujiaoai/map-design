import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
  toast,
  useConfirmDialog,
} from '@repo/ui'
import { ArrowLeftIcon, KeyRoundIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import {
  describePermissionModule,
  moduleInitials,
  PERMISSION_SCOPE_LABELS,
} from '~/features/permissions/lib/permission-module-labels'
import { PermissionsGuidanceStrip } from '~/features/permissions/ui/permissions-guidance-strip'
import {
  matchesModuleScopeFilter,
  PermissionsScopeFilter,
} from '~/features/permissions/ui/permissions-scope-filter'
import {
  createAdminPermission,
  createAdminPermissionModule,
  deleteAdminPermission,
  deleteAdminPermissionModule,
  fetchAdminPermissionModules,
  patchAdminPermission,
  patchAdminPermissionModule,
  type AdminPermission,
  type AdminPermissionModule,
} from '~/shared/api/admin-api'
import { AdminAntModal } from '~/shared/ant'
import { useAdminListSearchShortcut } from '~/shared/hooks/use-admin-list-search-shortcut'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminSidebarListSkeleton } from '~/shared/ui/admin-table-skeleton'
import { PermissionActionTreeView } from '~/shared/ui/permission-action-tree-view'

const SCOPE_OPTIONS: AdminPermissionModule['scope'][] = ['platform', 'tenant', 'workspace']

export function PermissionsAdminPage() {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:roles:write')
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()
  const [searchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  useAdminListSearchShortcut(searchInputRef)

  const modulesQuery = useQuery({
    queryKey: adminQueryKeys.permissionModules,
    queryFn: fetchAdminPermissionModules,
  })

  const modules = modulesQuery.data?.modules ?? []

  const [selectedModule, setSelectedModule] = useState<AdminPermissionModule | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [moduleSearch, setModuleSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState('all')
  const initialModuleAppliedRef = useRef(false)
  const initialModuleCode = searchParams.get('module') ?? undefined

  const [createModuleOpen, setCreateModuleOpen] = useState(false)
  const [createModuleError, setCreateModuleError] = useState<string | null>(null)
  const [moduleCode, setModuleCode] = useState('')
  const [moduleName, setModuleName] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')
  const [moduleScope, setModuleScope] = useState<AdminPermissionModule['scope']>('workspace')

  const [editModuleName, setEditModuleName] = useState('')
  const [editModuleDescription, setEditModuleDescription] = useState('')

  const [createPermissionOpen, setCreatePermissionOpen] = useState(false)
  const [createPermissionError, setCreatePermissionError] = useState<string | null>(null)
  const [permissionAction, setPermissionAction] = useState('')
  const [permissionName, setPermissionName] = useState('')
  const [permissionDescription, setPermissionDescription] = useState('')

  const [editingPermission, setEditingPermission] = useState<AdminPermission | null>(null)
  const [editPermissionName, setEditPermissionName] = useState('')
  const [editPermissionDescription, setEditPermissionDescription] = useState('')

  const permissionTotal = useMemo(
    () => modules.reduce((sum, module) => sum + module.permissions.length, 0),
    [modules],
  )

  const filteredModules = useMemo(() => {
    const query = moduleSearch.trim().toLowerCase()
    return modules.filter((module) => {
      if (!matchesModuleScopeFilter(module, scopeFilter)) return false
      if (!query) return true
      return (
        module.name.toLowerCase().includes(query) ||
        module.code.toLowerCase().includes(query)
      )
    })
  }, [moduleSearch, modules, scopeFilter])

  const selectedPermissions = useMemo(
    () => selectedModule?.permissions ?? [],
    [selectedModule?.permissions],
  )

  const isModuleDirty = useMemo(() => {
    if (!selectedModule) return false
    const nextDescription = editModuleDescription.trim()
    const savedDescription = selectedModule.description?.trim() ?? ''
    return (
      editModuleName.trim() !== selectedModule.name.trim() ||
      nextDescription !== savedDescription
    )
  }, [editModuleDescription, editModuleName, selectedModule])

  useEffect(() => {
    if (!modules.length) return
    if (!initialModuleAppliedRef.current) {
      if (initialModuleCode) {
        const matched = modules.find((module) => module.code === initialModuleCode)
        if (matched) {
          setSelectedModule(matched)
          initialModuleAppliedRef.current = true
          return
        }
      }
      if (!selectedModule) {
        setSelectedModule(modules[0] ?? null)
      }
      initialModuleAppliedRef.current = true
    }
  }, [initialModuleCode, modules, selectedModule])

  useEffect(() => {
    if (selectedModule) {
      setEditModuleName(selectedModule.name)
      setEditModuleDescription(selectedModule.description ?? '')
      setFormError(null)
    }
  }, [selectedModule])

  async function refreshModules() {
    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.permissionModules })
    await queryClient.invalidateQueries({ queryKey: adminQueryKeys.permissions })
  }

  function closeCreateModuleDialog() {
    setCreateModuleOpen(false)
    setCreateModuleError(null)
    setModuleCode('')
    setModuleName('')
    setModuleDescription('')
    setModuleScope('workspace')
  }

  function openCreateModuleDialog() {
    setCreateModuleError(null)
    setModuleCode('')
    setModuleName('')
    setModuleDescription('')
    setModuleScope('workspace')
    setCreateModuleOpen(true)
  }

  const createModuleMutation = useMutation({
    mutationFn: () =>
      createAdminPermissionModule({
        code: moduleCode.trim(),
        name: moduleName.trim(),
        description: moduleDescription.trim() || undefined,
        scope: moduleScope,
      }),
    onSuccess: async (created) => {
      await refreshModules()
      setSelectedModule(created)
      closeCreateModuleDialog()
      setFormError(null)
      toast.success('模块已创建', { description: '可在下方添加权限项。' })
    },
    onError: (error) => setCreateModuleError(formatAdminApiError(error)),
  })

  const patchModuleMutation = useMutation({
    mutationFn: () =>
      patchAdminPermissionModule(selectedModule!.id, {
        name: editModuleName.trim(),
        description: editModuleDescription.trim() || null,
      }),
    onSuccess: async () => {
      await refreshModules()
      setFormError(null)
      toast.success('模块信息已保存')
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  const deleteModuleMutation = useMutation({
    mutationFn: () => deleteAdminPermissionModule(selectedModule!.id),
    onSuccess: async () => {
      setSelectedModule(null)
      await refreshModules()
      setFormError(null)
      toast.success('模块已删除')
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  const createPermissionMutation = useMutation({
    mutationFn: () =>
      createAdminPermission(selectedModule!.id, {
        action: permissionAction.trim(),
        name: permissionName.trim(),
        description: permissionDescription.trim() || undefined,
      }),
    onSuccess: async () => {
      await refreshModules()
      closeCreatePermissionForm()
      setFormError(null)
      toast.success('权限项已创建')
    },
    onError: (error) => setCreatePermissionError(formatAdminApiError(error)),
  })

  const patchPermissionMutation = useMutation({
    mutationFn: () =>
      patchAdminPermission(editingPermission!.id, {
        name: editPermissionName.trim(),
        description: editPermissionDescription.trim() || null,
      }),
    onSuccess: async () => {
      await refreshModules()
      setEditingPermission(null)
      setFormError(null)
      toast.success('权限项已更新')
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  const deletePermissionMutation = useMutation({
    mutationFn: (permissionId: string) => deleteAdminPermission(permissionId),
    onSuccess: async () => {
      await refreshModules()
      setFormError(null)
      toast.success('权限项已删除')
    },
    onError: (error) => setFormError(formatAdminApiError(error)),
  })

  async function selectModule(module: AdminPermissionModule) {
    if (selectedModule?.id === module.id) return
    if (
      isModuleDirty &&
      selectedModule &&
      !(await confirm({
        title: '放弃未保存更改',
        description: '当前模块信息未保存，确定切换？',
        confirmLabel: '切换模块',
      }))
    ) {
      return
    }
    setSelectedModule(module)
    setEditingPermission(null)
    setCreatePermissionOpen(false)
  }

  function syncSelectedFromQuery() {
    if (!selectedModule || !modulesQuery.data) return
    const next = modulesQuery.data.modules.find((item) => item.id === selectedModule.id)
    if (next) setSelectedModule(next)
  }

  useEffect(() => {
    syncSelectedFromQuery()
  }, [modulesQuery.data])

  function closeCreatePermissionForm() {
    setCreatePermissionOpen(false)
    setCreatePermissionError(null)
    setPermissionAction('')
    setPermissionName('')
    setPermissionDescription('')
  }

  function openCreatePermissionDialog() {
    setCreatePermissionError(null)
    setPermissionAction('')
    setPermissionName('')
    setPermissionDescription('')
    setCreatePermissionOpen(true)
  }

  function renderPermissionCard(permission: AdminPermission) {
    if (editingPermission?.id === permission.id) {
      return (
        <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/6 p-3">
          <p className="font-mono text-xs text-muted-foreground">{permission.code}</p>
          <AdminField label="显示名">
            <Input
              value={editPermissionName}
              onChange={(event) => setEditPermissionName(event.target.value)}
            />
          </AdminField>
          <AdminField label="说明">
            <Input
              value={editPermissionDescription}
              onChange={(event) => setEditPermissionDescription(event.target.value)}
            />
          </AdminField>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={patchPermissionMutation.isPending}
              onClick={() => patchPermissionMutation.mutate()}
            >
              保存
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditingPermission(null)}
            >
              取消
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-xl border border-border/50 bg-background/20 p-3 transition-colors hover:border-border/70">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] text-muted-foreground">{permission.code}</p>
            <p className="text-sm font-medium">{permission.name}</p>
            {permission.description ? (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {permission.description}
              </p>
            ) : null}
            {permission.system ? (
              <Badge variant="secondary" className="mt-2 text-[10px]">
                系统内置
              </Badge>
            ) : null}
          </div>
          {canWrite && !permission.system ? (
            <div className="flex gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => {
                  setEditingPermission(permission)
                  setEditPermissionName(permission.name)
                  setEditPermissionDescription(permission.description ?? '')
                }}
              >
                <PencilIcon className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-destructive"
                disabled={deletePermissionMutation.isPending}
                onClick={async () => {
                  const confirmed = await confirm({
                    description: `确定删除权限 ${permission.code}？`,
                    confirmLabel: '删除',
                    destructive: true,
                  })
                  if (confirmed) {
                    deletePermissionMutation.mutate(permission.id)
                  }
                }}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 admin-stagger">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        nativeButton={false}
        render={<Link to="/" />}
      >
        <ArrowLeftIcon className="size-3.5" />
        返回概览
      </Button>

      <PermissionsGuidanceStrip
        moduleTotal={modules.length}
        permissionTotal={permissionTotal}
        loaded={Boolean(modulesQuery.data)}
        canWrite={canWrite}
        onCreateModule={openCreateModuleDialog}
      />

      <section className="space-y-3">
        <h2 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
          作用域筛选
        </h2>
        <PermissionsScopeFilter value={scopeFilter} onChange={setScopeFilter} />
      </section>

      <AdminAntModal
        title="新建权限模块"
        open={createModuleOpen && canWrite}
        onCancel={closeCreateModuleDialog}
        footer={null}
        width={560}
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-muted-foreground">
            自定义模块用于扩展 RBAC；系统内置模块不可在此创建。
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="模块码">
              <Input
                value={moduleCode}
                onChange={(event) => setModuleCode(event.target.value)}
                placeholder="map_tools"
                className="font-mono"
                autoFocus
              />
            </AdminField>
            <AdminField label="显示名">
              <Input value={moduleName} onChange={(event) => setModuleName(event.target.value)} />
            </AdminField>
            <AdminField label="作用域">
              <Select
                value={moduleScope}
                onValueChange={(value) => {
                  if (value) setModuleScope(value as AdminPermissionModule['scope'])
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPE_OPTIONS.map((scope) => (
                    <SelectItem key={scope} value={scope}>
                      {PERMISSION_SCOPE_LABELS[scope]} ({scope})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminField>
            <AdminField label="说明">
              <Input
                value={moduleDescription}
                onChange={(event) => setModuleDescription(event.target.value)}
              />
            </AdminField>
          </div>
          <AdminFormError message={createModuleError} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeCreateModuleDialog}>
              取消
            </Button>
            <Button
              type="button"
              disabled={createModuleMutation.isPending || !moduleCode.trim() || !moduleName.trim()}
              onClick={() => createModuleMutation.mutate()}
            >
              {createModuleMutation.isPending ? '创建中…' : '创建模块'}
            </Button>
          </div>
        </div>
      </AdminAntModal>

      <AdminAntModal
        title="添加权限项"
        open={createPermissionOpen && canWrite && Boolean(selectedModule) && !selectedModule?.system}
        onCancel={closeCreatePermissionForm}
        footer={null}
        width={560}
      >
        <div className="space-y-4 pt-1">
          {selectedModule ? (
            <p className="text-sm text-muted-foreground">
              模块 <span className="font-mono">{selectedModule.code}</span> · 完整权限码 ={' '}
              {selectedModule.code}:&lt;动作段&gt;
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="动作段">
              <Input
                value={permissionAction}
                onChange={(event) => setPermissionAction(event.target.value)}
                placeholder="layer:read"
                className="font-mono"
                autoFocus
              />
            </AdminField>
            <AdminField label="显示名">
              <Input
                value={permissionName}
                onChange={(event) => setPermissionName(event.target.value)}
              />
            </AdminField>
            <AdminField label="说明" className="sm:col-span-2">
              <Input
                value={permissionDescription}
                onChange={(event) => setPermissionDescription(event.target.value)}
              />
            </AdminField>
          </div>
          <AdminFormError message={createPermissionError} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeCreatePermissionForm}>
              取消
            </Button>
            <Button
              type="button"
              disabled={
                createPermissionMutation.isPending ||
                !permissionAction.trim() ||
                !permissionName.trim()
              }
              onClick={() => createPermissionMutation.mutate()}
            >
              {createPermissionMutation.isPending ? '创建中…' : '创建权限项'}
            </Button>
          </div>
        </div>
      </AdminAntModal>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <AdminPanel className="flex flex-col p-2">
          <div className="space-y-2 px-2 pb-2">
            <p className="admin-display text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              权限模块
            </p>
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                ref={searchInputRef}
                value={moduleSearch}
                onChange={(event) => setModuleSearch(event.target.value)}
                placeholder="搜索模块名或 code…"
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          {modulesQuery.isLoading ? (
            <AdminSidebarListSkeleton />
          ) : modulesQuery.isError ? (
            <AdminEmptyState
              message="加载失败，请刷新重试"
              onRetry={() => void modulesQuery.refetch()}
              isRetrying={modulesQuery.isFetching}
            />
          ) : !modules.length ? (
            <AdminEmptyState message="暂无权限模块" />
          ) : !filteredModules.length ? (
            <AdminEmptyState
              message="无匹配模块"
              action={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setModuleSearch('')
                    setScopeFilter('all')
                  }}
                >
                  清除筛选
                </Button>
              }
            />
          ) : (
            <ul className="admin-scroll-area -mr-1 min-h-0 flex-1 space-y-1 pr-1">
              {filteredModules.map((module) => {
                const active = selectedModule?.id === module.id
                return (
                  <li key={module.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      className={cn(
                        'w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
                        active
                          ? 'border-primary/40 bg-primary/12 text-primary shadow-sm'
                          : 'border-transparent text-muted-foreground hover:border-border/50 hover:bg-muted/40 hover:text-foreground',
                      )}
                      onClick={() => void selectModule(module)}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="block truncate font-medium">{module.name}</span>
                        <Badge variant="secondary" className="shrink-0 text-[9px]">
                          {PERMISSION_SCOPE_LABELS[module.scope]}
                        </Badge>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="block truncate font-mono text-[10px] opacity-80">
                          {module.code}
                        </span>
                        <span className="shrink-0 text-[10px] opacity-70">
                          {module.permissions.length} 项
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel className="p-0">
          {!selectedModule ? (
            <AdminEmptyState message="请选择权限模块" />
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div className="flex min-w-0 flex-1 gap-3">
                  <span
                    className="admin-tenant-avatar flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-sm font-semibold text-primary"
                    aria-hidden
                  >
                    {moduleInitials(selectedModule)}
                  </span>
                  <div className="min-w-0">
                    <p className="admin-display text-lg font-semibold">{selectedModule.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {selectedModule.code}
                      </Badge>
                      <span>{PERMISSION_SCOPE_LABELS[selectedModule.scope]}作用域</span>
                      <span>·</span>
                      <span>{selectedPermissions.length} 项权限</span>
                      {selectedModule.system ? (
                        <>
                          <span>·</span>
                          <Badge variant="secondary" className="text-[10px]">
                            系统内置
                          </Badge>
                        </>
                      ) : (
                        <>
                          <span>·</span>
                          <Badge variant="outline" className="text-[10px]">
                            自定义
                          </Badge>
                        </>
                      )}
                      {isModuleDirty ? (
                        <>
                          <span>·</span>
                          <span className="text-amber-600 dark:text-amber-400">有未保存更改</span>
                        </>
                      ) : null}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {describePermissionModule(selectedModule)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    render={<Link to="/roles" />}
                  >
                    <KeyRoundIcon className="size-3.5" />
                    系统角色
                  </Button>
                  {canWrite && !selectedModule.system ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={openCreatePermissionDialog}
                      >
                        <PlusIcon className="size-3.5" />
                        添加权限
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={patchModuleMutation.isPending || !isModuleDirty}
                        onClick={() => patchModuleMutation.mutate()}
                      >
                        {patchModuleMutation.isPending ? '保存中…' : '保存模块'}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={deleteModuleMutation.isPending || selectedPermissions.length > 0}
                        onClick={async () => {
                          const confirmed = await confirm({
                            description: '确定删除该模块？须先清空模块下权限项。',
                            confirmLabel: '删除',
                            destructive: true,
                          })
                          if (confirmed) deleteModuleMutation.mutate()
                        }}
                      >
                        <Trash2Icon className="size-4" />
                        删除
                      </Button>
                    </>
                  ) : canWrite ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={patchModuleMutation.isPending || !isModuleDirty}
                      onClick={() => patchModuleMutation.mutate()}
                    >
                      {patchModuleMutation.isPending ? '保存中…' : '保存模块'}
                    </Button>
                  ) : null}
                </div>
              </div>

              {canWrite ? (
                <div className="grid gap-3 border-b border-border/60 px-5 py-4 md:grid-cols-2">
                  <AdminField label="模块显示名">
                    <Input
                      value={editModuleName}
                      onChange={(event) => setEditModuleName(event.target.value)}
                      disabled={!canWrite}
                    />
                  </AdminField>
                  <AdminField label="模块说明">
                    <Input
                      value={editModuleDescription}
                      onChange={(event) => setEditModuleDescription(event.target.value)}
                    />
                  </AdminField>
                </div>
              ) : null}

              {selectedModule.system ? (
                <p className="border-b border-border/60 bg-muted/10 px-5 py-3 text-xs text-muted-foreground">
                  系统内置模块的权限项由迁移脚本维护，此处不可新增或删除。如需扩展能力，请通过引导条「新建模块」创建自定义模块。
                </p>
              ) : !canWrite ? (
                <p className="border-b border-border/60 bg-muted/10 px-5 py-3 text-xs text-muted-foreground">
                  当前账号仅有只读权限（需 admin:roles:write 才能新增权限项）。
                </p>
              ) : null}

              <div className="p-5">
                {selectedPermissions.length === 0 ? (
                  <AdminEmptyState
                    message="该模块暂无权限项"
                    action={
                      canWrite && !selectedModule.system ? (
                        <Button type="button" size="sm" onClick={openCreatePermissionDialog}>
                          <PlusIcon className="size-4" />
                          添加权限
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <PermissionActionTreeView
                    permissions={selectedPermissions}
                    moduleCode={selectedModule.code}
                    emptyMessage="无匹配权限项"
                    renderPermission={renderPermissionCard}
                  />
                )}
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
