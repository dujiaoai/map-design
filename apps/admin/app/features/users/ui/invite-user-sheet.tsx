import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { authPasswordFieldSchema } from '@repo/auth'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { fetchAdminTenants, inviteAdminUser } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { PasswordInput } from '~/shared/ui/password-input'

const schema = z.object({
  tenantId: z.string().min(1, '请选择租户'),
  email: z.string().min(1, '请输入邮箱').email('邮箱格式不正确'),
  password: authPasswordFieldSchema(),
  displayName: z.string().max(128).optional(),
  roleCode: z.enum(['TENANT_ADMIN', 'MEMBER', 'VIEWER']),
})

type FormValues = z.infer<typeof schema>

export function InviteUserSheet({
  open,
  onOpenChange,
  defaultTenantId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTenantId?: string
}) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const tenantsQuery = useQuery({
    queryKey: adminQueryKeys.tenantsAll,
    queryFn: () => fetchAdminTenants(),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      tenantId: defaultTenantId ?? '',
      email: '',
      password: '',
      displayName: '',
      roleCode: 'MEMBER',
    },
  })

  const tenantId = watch('tenantId')
  const roleCode = watch('roleCode')

  const mutation = useMutation({
    mutationFn: inviteAdminUser,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      reset({
        tenantId: defaultTenantId ?? '',
        email: '',
        password: '',
        displayName: '',
        roleCode: 'MEMBER',
      })
      setSuccessMessage(`已邀请 ${variables.email}`)
      window.setTimeout(() => {
        setSuccessMessage(null)
        onOpenChange(false)
      }, 1200)
    },
  })

  function onSubmit(values: FormValues) {
    mutation.mutate({
      tenantId: values.tenantId,
      email: values.email.trim(),
      password: values.password,
      displayName: values.displayName?.trim() || undefined,
      roleCode: values.roleCode,
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setSuccessMessage(null)
        if (next && defaultTenantId) setValue('tenantId', defaultTenantId)
        onOpenChange(next)
      }}
    >
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">邀请用户</SheetTitle>
          <SheetDescription>在指定租户下创建账号并分配角色。</SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col gap-4 px-4" onSubmit={handleSubmit(onSubmit)}>
          <AdminField label="租户">
            <Select
              value={tenantId}
              onValueChange={(value) => setValue('tenantId', value ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择租户" />
              </SelectTrigger>
              <SelectContent>
                {(tenantsQuery.data?.tenants ?? []).map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tenantId ? (
              <p className="text-xs text-destructive">{errors.tenantId.message}</p>
            ) : null}
          </AdminField>
          <AdminField label="邮箱" htmlFor="invite-email" error={errors.email?.message}>
            <Input id="invite-email" autoComplete="off" {...register('email')} />
          </AdminField>
          <AdminField label="密码" htmlFor="invite-password" error={errors.password?.message}>
            <PasswordInput id="invite-password" autoComplete="new-password" {...register('password')} />
          </AdminField>
          <AdminField label="显示名" htmlFor="invite-display" error={errors.displayName?.message}>
            <Input id="invite-display" {...register('displayName')} />
          </AdminField>
          <AdminField label="角色">
            <Select
              value={roleCode}
              onValueChange={(value) =>
                setValue('roleCode', (value ?? 'MEMBER') as FormValues['roleCode'])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TENANT_ADMIN">TENANT_ADMIN</SelectItem>
                <SelectItem value="MEMBER">MEMBER</SelectItem>
                <SelectItem value="VIEWER">VIEWER</SelectItem>
              </SelectContent>
            </Select>
          </AdminField>
          {successMessage ? (
            <p className="text-sm text-primary">{successMessage}</p>
          ) : null}
          <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? '邀请中…' : '发送邀请'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
