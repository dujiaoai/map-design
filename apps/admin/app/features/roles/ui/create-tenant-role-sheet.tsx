import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
  toast,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { RolePermissionEditor } from '~/features/roles/ui/role-permission-editor'
import {
  createTenantCustomRole,
  fetchTenantAssignablePermissions,
  type TenantRoleSummary,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

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

export function CreateTenantRoleSheet({
  tenantId,
  open,
  onOpenChange,
  onCreated,
}: {
  tenantId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (role: TenantRoleSummary) => void
}) {
  const queryClient = useQueryClient()
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])

  const permissionsQuery = useQuery({
    queryKey: adminQueryKeys.tenantAssignablePermissions(tenantId),
    queryFn: () => fetchTenantAssignablePermissions(tenantId),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { code: '', name: '', description: '' },
  })

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
      reset()
      setSelectedCodes([])
      onOpenChange(false)
      onCreated?.(role)
      toast.success('自定义角色已创建')
    },
  })

  function onSubmit(values: FormValues) {
    mutation.mutate(values)
  }

  function requestClose() {
    if (mutation.isPending) return
    onOpenChange(false)
  }

  const permissions = permissionsQuery.data?.permissions ?? []

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) requestClose()
      }}
    >
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b border-border/50 px-4 pb-4">
          <p className="admin-display text-[10px] tracking-[0.22em] text-primary/75 uppercase">
            Role Onboarding
          </p>
          <SheetTitle className="admin-display text-xl">新建自定义角色</SheetTitle>
          <SheetDescription>
            定义角色码与显示名，并勾选初始权限集合；创建后可继续调整。
          </SheetDescription>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="admin-scroll-area flex-1 space-y-5 px-4 py-5">
            <section className="space-y-4">
              <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                角色标识
              </h3>
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
              <AdminField
                label="描述（可选）"
                htmlFor="create-role-description"
                error={errors.description?.message}
              >
                <Textarea
                  id="create-role-description"
                  rows={2}
                  placeholder="说明该角色的职责"
                  {...register('description')}
                />
              </AdminField>
            </section>

            <section className="space-y-3">
              <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                初始权限
              </h3>
              <p className="text-xs text-muted-foreground">
                创建时即可勾选多项权限；也可创建后在角色详情中继续调整。
              </p>
              {permissionsQuery.isError ? (
                <AdminFormError message="加载可分配权限失败，请关闭后重试" />
              ) : (
                <RolePermissionEditor
                  permissions={permissions}
                  selectedCodes={selectedCodes}
                  onSelectedCodesChange={setSelectedCodes}
                />
              )}
            </section>

            <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
          </div>

          <SheetFooter className="shrink-0 gap-2 border-t border-border/50 px-4 py-4 sm:justify-end">
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={requestClose}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending || permissionsQuery.isError}>
              {mutation.isPending ? '创建中…' : '创建角色'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
