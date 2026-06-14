import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { SaaSRole } from '@repo/auth'
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

import {
  type AdminUserSummary,
  patchAdminUser,
  updateAdminUserRoles,
} from '~/shared/api/admin-api'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  displayName: z.string().min(1, '请输入显示名').max(128),
  status: z.enum(['active', 'disabled']),
  platformAdmin: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function EditUserSheet({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantFilterId?: string
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
  const platformAdmin = watch('platformAdmin')

  useEffect(() => {
    if (!user) return
    reset({
      displayName: user.displayName,
      status: user.status === 'disabled' ? 'disabled' : 'active',
      platformAdmin: user.roles.includes(SaaSRole.PLATFORM_ADMIN),
    })
  }, [user, reset])

  const isInvited = user?.status === 'invited'

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const profile = await patchAdminUser(user!.id, {
        displayName: values.displayName.trim(),
        status: values.status,
      })
      const roleCodes = values.platformAdmin ? [SaaSRole.PLATFORM_ADMIN] : []
      const hadPlatformAdmin = user!.roles.includes(SaaSRole.PLATFORM_ADMIN)
      if (values.platformAdmin !== hadPlatformAdmin) {
        return updateAdminUserRoles(user!.id, roleCodes)
      }
      return profile
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onOpenChange(false)
    },
  })

  function onSubmit(values: FormValues) {
    if (!user) return
    mutation.mutate(values)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">编辑用户</SheetTitle>
          <SheetDescription>{user?.email ?? '—'}</SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col gap-4 px-4" onSubmit={handleSubmit(onSubmit)}>
          <AdminField label="显示名" htmlFor="edit-user-name" error={errors.displayName?.message}>
            <Input id="edit-user-name" {...register('displayName')} />
          </AdminField>
          <AdminField label="状态">
            {isInvited ? (
              <p className="text-sm text-muted-foreground">
                待激活（历史邮件邀请账号，请让用户通过原邮件链接完成设密）
              </p>
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
          <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
            <input
              id="edit-user-platform-admin"
              type="checkbox"
              className="mt-1 size-4 rounded border-border"
              checked={platformAdmin}
              onChange={(event) => setValue('platformAdmin', event.target.checked)}
            />
            <div className="space-y-1">
              <label htmlFor="edit-user-platform-admin" className="font-mono text-sm">
                PLATFORM_ADMIN
              </label>
              <p className="text-xs text-muted-foreground">
                平台运营权限；租户角色请在「成员」页管理。变更后用户需重新登录。
              </p>
            </div>
          </div>
          <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={!user || isSubmitting || mutation.isPending}>
              {mutation.isPending ? '保存中…' : '保存更改'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
