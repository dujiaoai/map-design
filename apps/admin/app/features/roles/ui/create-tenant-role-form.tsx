import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, Input, Textarea, toast } from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { RolePermissionEditor } from '~/features/roles/ui/role-permission-editor'
import {
  createTenantCustomRole,
  type AdminPermission,
  type TenantRoleSummary,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminPanel } from '~/shared/ui/admin-page-shell'

const schema = z.object({
  code: z
    .string()
    .min(2, '至少 2 个字符')
    .max(32)
    .regex(/^[a-z][a-z0-9_]*$/, '小写字母开头，仅含小写字母、数字与下划线'),
  name: z.string().min(1, '请输入显示名').max(64),
  description: z.string().max(256).optional(),
})

type FormValues = z.infer<typeof schema>

export function CreateTenantRoleForm({
  tenantId,
  permissions,
  permissionsLoading,
  permissionsError,
  onDirtyChange,
  onCancel,
  onCreated,
}: {
  tenantId: string
  permissions: AdminPermission[]
  permissionsLoading?: boolean
  permissionsError?: boolean
  onDirtyChange?: (dirty: boolean) => void
  onCancel: () => void
  onCreated: (role: TenantRoleSummary) => void
}) {
  const queryClient = useQueryClient()
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { code: '', name: '', description: '' },
  })

  const codeValue = watch('code')
  const nameValue = watch('name')
  const descriptionValue = watch('description') ?? ''

  const formDirty = useMemo(
    () =>
      codeValue.trim().length > 0 ||
      nameValue.trim().length > 0 ||
      descriptionValue.trim().length > 0 ||
      selectedCodes.length > 0,
    [codeValue, descriptionValue, nameValue, selectedCodes.length],
  )

  useEffect(() => {
    onDirtyChange?.(formDirty)
  }, [formDirty, onDirtyChange])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createTenantCustomRole(tenantId, {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        permissionCodes: selectedCodes,
      }),
    onSuccess: async (role) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantCustomRoles(tenantId) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.assignableRoles(tenantId) }),
      ])
      toast.success('自定义角色已创建')
      onCreated(role)
    },
  })

  const previewCode = codeValue.trim() || 'role_code'
  const previewName = nameValue.trim() || '新角色'

  return (
    <form className="space-y-6" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <div className="admin-create-tenant-preview rounded-xl border border-primary/25 bg-primary/6 p-4 md:p-5">
        <p className="admin-display text-[10px] tracking-[0.2em] text-primary/70 uppercase">
          角色预览
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="admin-tenant-avatar flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-sm font-semibold text-primary">
            {previewCode.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{previewName}</p>
            <p className="font-mono text-xs text-muted-foreground">{previewCode}</p>
          </div>
          <span className="rounded-md border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground">
            已选 {selectedCodes.length} 项权限
          </span>
        </div>
      </div>

      <AdminPanel className="space-y-4 p-4 md:p-5">
        <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
          角色标识
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminField label="角色码" htmlFor="create-role-code" error={errors.code?.message}>
            <Input
              id="create-role-code"
              className="font-mono"
              placeholder="map_editor"
              autoComplete="off"
              {...register('code')}
            />
          </AdminField>
          <AdminField label="显示名" htmlFor="create-role-name" error={errors.name?.message}>
            <Input id="create-role-name" placeholder="地图编辑员" {...register('name')} />
          </AdminField>
        </div>
        <AdminField
          label="描述（可选）"
          htmlFor="create-role-description"
          error={errors.description?.message}
        >
          <Textarea
            id="create-role-description"
            rows={3}
            placeholder="说明该角色的职责与使用场景"
            {...register('description')}
          />
        </AdminField>
      </AdminPanel>

      <AdminPanel className="space-y-4 p-4 md:p-5">
        <div>
          <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
            初始权限
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            勾选 tenant / workspace 权限组成能力集合；创建后仍可在角色详情中继续调整。
          </p>
        </div>
        {permissionsLoading ? (
          <p className="text-sm text-muted-foreground">加载可分配权限…</p>
        ) : permissionsError ? (
          <AdminFormError message="加载可分配权限失败，请刷新页面后重试" />
        ) : (
          <RolePermissionEditor
            permissions={permissions}
            selectedCodes={selectedCodes}
            onSelectedCodesChange={setSelectedCodes}
          />
        )}
      </AdminPanel>

      <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />

      <div className="flex flex-wrap justify-end gap-2 border-t border-border/50 pt-4">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
          取消
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || mutation.isPending || permissionsError || permissionsLoading}
        >
          <PlusIcon className="size-3.5" />
          {mutation.isPending ? '创建中…' : '创建角色'}
        </Button>
      </div>
    </form>
  )
}
