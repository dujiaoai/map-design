import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { type AdminTenantSummary, patchAdminTenant } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  name: z.string().min(1, '请输入名称').max(128),
  plan: z.string().min(1, '请输入计划').max(32),
  status: z.enum(['active', 'suspended']),
})

type FormValues = z.infer<typeof schema>

export function EditTenantSheet({
  tenant,
  open,
  onOpenChange,
}: {
  tenant: AdminTenantSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
  })

  const status = watch('status')

  useEffect(() => {
    if (!tenant) return
    reset({
      name: tenant.name,
      plan: tenant.plan,
      status: tenant.status === 'suspended' ? 'suspended' : 'active',
    })
  }, [tenant, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      patchAdminTenant(tenant!.id, {
        name: values.name.trim(),
        plan: values.plan.trim(),
        status: values.status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      if (tenant) {
        await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenant(tenant.id) })
      }
      onOpenChange(false)
    },
  })

  function onSubmit(values: FormValues) {
    if (!tenant) return
    mutation.mutate(values)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">编辑租户</SheetTitle>
          <SheetDescription>{tenant?.slug ?? '—'}</SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col gap-4 px-4" onSubmit={handleSubmit(onSubmit)}>
          <AdminField label="显示名" htmlFor="edit-tenant-name" error={errors.name?.message}>
            <Input id="edit-tenant-name" {...register('name')} />
          </AdminField>
          <AdminField label="计划" htmlFor="edit-tenant-plan" error={errors.plan?.message}>
            <Input id="edit-tenant-plan" {...register('plan')} />
          </AdminField>
          <AdminField label="状态">
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as FormValues['status'])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="suspended">已停用</SelectItem>
              </SelectContent>
            </Select>
          </AdminField>
          <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={!tenant || isSubmitting || mutation.isPending}>
              {mutation.isPending ? '保存中…' : '保存更改'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
