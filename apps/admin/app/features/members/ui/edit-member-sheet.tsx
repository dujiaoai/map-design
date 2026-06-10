import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  Badge,
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

import {
  type AdminUserSummary,
  patchTenantMember,
  updateTenantMemberRoles,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const TENANT_ROLES = ['TENANT_ADMIN', 'MEMBER', 'VIEWER'] as const

const schema = z.object({
  displayName: z.string().min(1, '请输入显示名').max(128),
  status: z.enum(['active', 'disabled']),
  roleCode: z.enum(TENANT_ROLES),
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
    const primaryRole =
      member.roles.find((role) => TENANT_ROLES.includes(role as (typeof TENANT_ROLES)[number])) ??
      'MEMBER'
    reset({
      displayName: member.displayName,
      status: member.status === 'disabled' ? 'disabled' : 'active',
      roleCode: primaryRole as FormValues['roleCode'],
    })
  }, [member, reset])

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
    },
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">编辑成员</SheetTitle>
          <SheetDescription>{member?.email ?? '—'}</SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col gap-4 px-4"
          onSubmit={handleSubmit((values) => {
            if (!member) return
            mutation.mutate(values)
          })}
        >
          <AdminField label="显示名" htmlFor="edit-member-name" error={errors.displayName?.message}>
            <Input id="edit-member-name" {...register('displayName')} />
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
                <SelectItem value="disabled">已禁用</SelectItem>
              </SelectContent>
            </Select>
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
                {TENANT_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminField>
          {member?.roles.some((role) => role === 'PLATFORM_ADMIN') ? (
            <Badge variant="outline" className="w-fit font-mono text-[10px]">
              含 PLATFORM_ADMIN，角色编辑可能受限
            </Badge>
          ) : null}
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
