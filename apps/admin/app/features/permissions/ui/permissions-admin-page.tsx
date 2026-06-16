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
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

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
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import {
  AdminRbacEditorSkeleton,
  AdminSidebarListSkeleton,
} from '~/shared/ui/admin-table-skeleton'
import { PermissionActionTreeView } from '~/shared/ui/permission-action-tree-view'

import { PERMISSION_SCOPE_LABELS } from '../../roles/lib/role-permission-rules'

const SCOPE_OPTIONS: AdminPermissionModule['scope'][] = ['platform', 'tenant', 'workspace']

export function PermissionsAdminPage() {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:roles:write')
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()

  const modulesQuery = useQuery({
    queryKey: adminQueryKeys.permissionModules,
    queryFn: fetchAdminPermissionModules,
  })

  const [selectedModule, setSelectedModule] = useState<AdminPermissionModule | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!selectedModule && modulesQuery.data?.modules.length) {
      setSelectedModule(modulesQuery.data.modules[0] ?? null)
    }
  }, [modulesQuery.data?.modules, selectedModule])

  useEffect(() => {
    if (selectedModule) {
      setEditModuleName(selectedModule.name)
      setEditModuleDescription(selectedModule.description ?? '')
      setFormError(null)
    }
  }, [selectedModule])

  const selectedPermissions = useMemo(
    () => selectedModule?.permissions ?? [],
    [selectedModule?.permissions],
  )

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

  function selectModule(module: AdminPermissionModule) {
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

  return (
    <div className="space-y-6 admin-stagger">
      <AdminPageHeader
        eyebrow="RBAC"
        title="权限目录"
        description="按模块组织权限码；自定义模块下可增删改权限项，系统内置项受保护。"
        actions={
          canWrite ? (
            <Button type="button" size="sm" onClick={openCreateModuleDialog}>
              <PlusIcon className="size-4" />
              新建模块
            </Button>
          ) : null
        }
      />

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
        <AdminPanel className="p-2">
          <p className="px-3 py-2 text-xs tracking-[0.14em] text-muted-foreground uppercase">
            模块
          </p>
          {modulesQuery.isLoading ? (
            <AdminSidebarListSkeleton />
          ) : modulesQuery.isError ? (
            <AdminEmptyState
              message="加载失败，请刷新重试"
              onRetry={() => void modulesQuery.refetch()}
              isRetrying={modulesQuery.isFetching}
            />
          ) : (
            <ul className="space-y-1">
              {(modulesQuery.data?.modules ?? []).map((module) => (
                <li key={module.id}>
                  <button
                    type="button"
                    className={cn(
                      'admin-nav-link w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      selectedModule?.id === module.id
                        ? 'bg-primary/12 text-primary'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                    onClick={() => selectModule(module)}
                  >
                    <span className="block font-medium">{module.name}</span>
                    <span className="block font-mono text-[11px] opacity-80">{module.code}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel className="p-0">
          {!selectedModule ? (
            <AdminEmptyState message="请选择模块" />
          ) : (
            <div className="flex flex-col">
              <div className="space-y-4 border-b border-border/60 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="admin-display text-lg font-semibold">{selectedModule.name}</p>
                    <p className="font-mono text-sm text-muted-foreground">{selectedModule.code}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {PERMISSION_SCOPE_LABELS[selectedModule.scope]}
                      </Badge>
                      {selectedModule.system ? (
                        <Badge variant="secondary">系统内置</Badge>
                      ) : (
                        <Badge variant="outline">自定义</Badge>
                      )}
                      <Badge variant="outline">{selectedPermissions.length} 项权限</Badge>
                    </div>
                  </div>
                  {canWrite && !selectedModule.system ? (
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
                      删除模块
                    </Button>
                  ) : null}
                </div>

                {canWrite ? (
                  <div className="grid gap-3 md:grid-cols-2">
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
                {canWrite ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={patchModuleMutation.isPending || !editModuleName.trim()}
                    onClick={() => patchModuleMutation.mutate()}
                  >
                    保存模块信息
                  </Button>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
                <p className="text-sm font-medium">权限项</p>
                {canWrite && !selectedModule.system ? (
                  <Button type="button" size="sm" variant="outline" onClick={openCreatePermissionDialog}>
                    <PlusIcon className="size-4" />
                    添加权限
                  </Button>
                ) : null}
              </div>

              {selectedModule.system ? (
                <p className="border-b border-border/60 bg-muted/10 px-5 py-3 text-xs text-muted-foreground">
                  系统内置模块的权限项由迁移脚本维护，此处不可新增或删除。如需扩展能力，请先点击页头「新建模块」创建自定义模块，再在其下添加权限项。
                </p>
              ) : !canWrite ? (
                <p className="border-b border-border/60 bg-muted/10 px-5 py-3 text-xs text-muted-foreground">
                  当前账号仅有只读权限（需 admin:roles:write 才能新增权限项）。
                </p>
              ) : null}

              <div className="p-5">
                {selectedPermissions.length === 0 ? (
                  <AdminEmptyState message="该模块暂无权限项" />
                ) : (
                  <PermissionActionTreeView
                    permissions={selectedPermissions}
                    moduleCode={selectedModule.code}
                    emptyMessage="无匹配权限项"
                    renderPermission={(permission) =>
                      editingPermission?.id === permission.id ? (
                        <div className="space-y-3 rounded-lg border border-border/60 p-3">
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
                              onChange={(event) =>
                                setEditPermissionDescription(event.target.value)
                              }
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
                      ) : (
                        <div className="rounded-lg border border-border/60 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-xs">{permission.code}</p>
                              <p className="text-sm font-medium">{permission.name}</p>
                              {permission.description ? (
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              ) : null}
                              {permission.system ? (
                                <Badge variant="secondary" className="mt-2">
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
                  />
                )}
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
