import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  fetchAssignableRoles,
  inviteTenantMemberByEmail,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

import { formatMemberRoleLabel } from '../lib/member-role-labels'

const schema = z.object({
  email: z.string().min(1, '请输入邮箱').email('请输入有效邮箱'),
  displayName: z.string().max(128).optional(),
  roleCode: z.string().min(1, '请选择角色'),
})

type FormValues = z.infer<typeof schema>

export function TenantEmailInvitePanel({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient()

  const assignableRolesQuery = useQuery({
    queryKey: adminQueryKeys.assignableRoles(tenantId),
    queryFn: () => fetchAssignableRoles(tenantId),
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
      email: '',
      displayName: '',
      roleCode: 'MEMBER',
    },
  })

  const roleCode = watch('roleCode')

  useEffect(() => {
    const roles = assignableRolesQuery.data?.roles ?? []
    if (!roles.length) return
    if (!roles.some((role) => role.code === roleCode)) {
      setValue('roleCode', roles[0]!.code)
    }
  }, [assignableRolesQuery.data?.roles, roleCode, setValue])

  const inviteMutation = useMutation({
    mutationFn: (values: FormValues) =>
      inviteTenantMemberByEmail(tenantId, {
        email: values.email.trim(),
        displayName: values.displayName?.trim() || undefined,
        roleCode: values.roleCode,
      }),
    onSuccess: async (member) => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.membersRoot(tenantId) })
      reset({ email: '', displayName: '', roleCode: roleCode || 'MEMBER' })
      toast.success(`已向 ${member.email} 发送邀请邮件`)
    },
  })

  function onSubmit(values: FormValues) {
    inviteMutation.mutate(values)
  }

  const roles = assignableRolesQuery.data?.roles ?? []

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <p className="text-sm text-muted-foreground">
        系统将向邮箱发送 accept-invite 链接；受邀用户设密后即加入租户（status=invited 直至完成）。
      </p>
      <AdminField label="邮箱" htmlFor="email-invite-email" error={errors.email?.message}>
        <Input
          id="email-invite-email"
          type="email"
          autoComplete="off"
          placeholder="member@example.com"
          {...register('email')}
        />
      </AdminField>
      <AdminField label="显示名（可选）" htmlFor="email-invite-name" error={errors.displayName?.message}>
        <Input id="email-invite-name" placeholder="留空则使用邮箱前缀" {...register('displayName')} />
      </AdminField>
      <AdminField label="角色" error={errors.roleCode?.message}>
        <Select value={roleCode} onValueChange={(value) => setValue('roleCode', value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择角色" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.code} value={role.code}>
                {formatMemberRoleLabel(role.code, role.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminField>
      <AdminFormError message={inviteMutation.isError ? formatAdminApiError(inviteMutation.error) : null} />
      <Button
        type="submit"
        size="sm"
        disabled={isSubmitting || inviteMutation.isPending || roles.length === 0}
      >
        {inviteMutation.isPending ? '发送中…' : '发送邀请邮件'}
      </Button>
    </form>
  )
}
