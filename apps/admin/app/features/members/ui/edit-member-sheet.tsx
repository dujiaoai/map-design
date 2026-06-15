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
  toast,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  fetchAssignableRoles,
  patchTenantMember,
  updateTenantMemberRoles,
  type AdminUserSummary,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  displayName: z.string().min(1, '请输入显示名').max(128),
  status: z.enum(['active', 'disabled']),
  roleCode: z.string().min(1, '请选择角色'),
})

type FormValues = z.infer<typeof schema>

export function EditMemberSheet({
  tenantId,
  member,
  open,
  onOpenChange,
}: {
  tenantId: string
  member: AdminUserSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const assignableRolesQuery = useQuery({
    queryKey: adminQueryKeys.assignableRoles(tenantId),
    queryFn: () => fetchAssignableRoles(tenantId),
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
  })

  const status = watch('status')
  const roleCode = watch('roleCode')

  useEffect(() => {
    if (!member) return
    const assignable = assignableRolesQuery.data?.roles ?? []
    const primaryRole =
      member.roles.find((role) => assignable.some((item) => item.code === role)) ??
      assignable[0]?.code ??
      'MEMBER'
    reset({
      displayName: member.displayName,
      status: member.status === 'disabled' ? 'disabled' : 'active',
      roleCode: primaryRole,
    })
  }, [assignableRolesQuery.data?.roles, member, reset])

  const isInvited = member?.status === 'invited'

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      await patchTenantMember(tenantId, member!.id, {
        displayName: values.displayName.trim(),
        status: values.status,
      })
      return updateTenantMemberRoles(tenantId, member!.id, [values.roleCode])
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.members(tenantId) })
      onOpenChange(false)
      toast.success('成员已更新')
    },
  })

  function onSubmit(values: FormValues) {
    if (!member) return
    mutation.mutate(values)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">编辑成员</SheetTitle>
          <SheetDescription>{member?.email ?? '—'}</SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col gap-4 px-4" onSubmit={handleSubmit(onSubmit)}>
          <AdminField label="显示名" htmlFor="edit-member-name" error={errors.displayName?.message}>
            <Input id="edit-member-name" {...register('displayName')} />
          </AdminField>
          <AdminField label="状态">
            {isInvited ? (
              <p className="text-sm text-muted-foreground">待激活（邀请链接注册未完成）</p>
            ) : (
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value as FormValues['status'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="disabled">已禁用</SelectItem>
                </SelectContent>
              </Select>
            )}
          </AdminField>
          <AdminField label="角色" error={errors.roleCode?.message}>
            <Select value={roleCode} onValueChange={(value) => setValue('roleCode', value ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                {(assignableRolesQuery.data?.roles ?? []).map((role) => (
                  <SelectItem key={role.id} value={role.code}>
                    {role.name}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {role.code}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminField>
          <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={!member || isSubmitting || mutation.isPending}>
              {mutation.isPending ? '保存中…' : '保存更改'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
