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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { EditTenantRolePreview } from '~/features/roles/ui/edit-tenant-role-preview'
import { patchTenantCustomRole, type TenantRoleSummary } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  name: z.string().min(1, '请输入显示名').max(64),
  description: z.string().max(256).optional(),
})

type FormValues = z.infer<typeof schema>

function buildDefaultValues(role: TenantRoleSummary): FormValues {
  return {
    name: role.name,
    description: role.description ?? '',
  }
}

export function EditTenantRoleSheet({
  tenantId,
  role,
  open,
  onOpenChange,
}: {
  tenantId: string
  role: TenantRoleSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
  })

  const nameValue = watch('name')
  const descriptionValue = watch('description') ?? ''

  useEffect(() => {
    if (!role || !open) return
    reset(buildDefaultValues(role))
  }, [role, open, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      patchTenantCustomRole(tenantId, role!.id, {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantCustomRoles(tenantId) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.assignableRoles(tenantId) }),
      ])
      onOpenChange(false)
      toast.success('角色信息已更新')
    },
  })

  function onSubmit(values: FormValues) {
    if (!role) return
    mutation.mutate(values)
  }

  function requestClose() {
    if (mutation.isPending) return
    onOpenChange(false)
  }

  const readOnly = role?.system

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
            Role Registry
          </p>
          <SheetTitle className="admin-display text-xl">编辑角色</SheetTitle>
          <SheetDescription>
            更新显示名与描述；角色码创建后不可修改。
          </SheetDescription>
        </SheetHeader>

        {role ? (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="admin-scroll-area flex-1 space-y-5 px-4 py-5">
              <EditTenantRolePreview
                role={role}
                name={nameValue}
                description={descriptionValue}
              />

              <section className="space-y-4">
                <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  基本信息
                </h3>
                <AdminField label="角色码（只读）" htmlFor="edit-role-code">
                  <Input
                    id="edit-role-code"
                    className="font-mono"
                    value={role.code}
                    readOnly
                    disabled
                  />
                </AdminField>
                <AdminField
                  label="显示名"
                  htmlFor="edit-role-name"
                  error={errors.name?.message}
                >
                  <Input
                    id="edit-role-name"
                    placeholder="地图编辑员"
                    disabled={readOnly}
                    {...register('name')}
                  />
                </AdminField>
                <AdminField
                  label="描述（可选）"
                  htmlFor="edit-role-description"
                  error={errors.description?.message}
                >
                  <Textarea
                    id="edit-role-description"
                    rows={3}
                    placeholder="说明该角色的职责与使用场景"
                    disabled={readOnly}
                    {...register('description')}
                  />
                </AdminField>
                {readOnly ? (
                  <p className="text-xs text-muted-foreground">
                    系统内置角色不可修改名称与描述；权限请在右侧编辑器中调整（若允许）。
                  </p>
                ) : null}
              </section>

              <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
            </div>

            <SheetFooter className="shrink-0 gap-2 border-t border-border/50 px-4 py-4 sm:justify-end">
              <Button type="button" variant="outline" disabled={mutation.isPending} onClick={requestClose}>
                取消
              </Button>
              <Button
                type="submit"
                disabled={readOnly || !isDirty || isSubmitting || mutation.isPending}
              >
                {mutation.isPending ? '保存中…' : '保存更改'}
              </Button>
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
