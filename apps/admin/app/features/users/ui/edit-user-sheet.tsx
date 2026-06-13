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

import { type AdminUserSummary, patchAdminUser, resendAdminUserInvite } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  displayName: z.string().min(1, '请输入显示名').max(128),
  status: z.enum(['active', 'disabled']),
})

type FormValues = z.infer<typeof schema>

export function EditUserSheet({
  user,
  open,
  onOpenChange,
  tenantFilterId,
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

  useEffect(() => {
    if (!user) return
    reset({
      displayName: user.displayName,
      status: user.status === 'disabled' ? 'disabled' : 'active',
    })
  }, [user, reset])

  const isInvited = user?.status === 'invited'

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      patchAdminUser(user!.id, {
        displayName: values.displayName.trim(),
        status: values.status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onOpenChange(false)
    },
  })

  const resendMutation = useMutation({
    mutationFn: () => resendAdminUserInvite(user!.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
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
              <p className="text-sm text-muted-foreground">待接受邀请（用户设密后自动变为正常）</p>
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
          {isInvited ? (
            <Button
              type="button"
              variant="outline"
              disabled={resendMutation.isPending}
              onClick={() => resendMutation.mutate()}
            >
              {resendMutation.isPending ? '发送中…' : '重发设密邮件'}
            </Button>
          ) : null}
          <AdminFormError
            message={
              mutation.isError
                ? formatAdminApiError(mutation.error)
                : resendMutation.isError
                  ? formatAdminApiError(resendMutation.error)
                  : resendMutation.isSuccess
                    ? '已重新发送设密邮件'
                    : null
            }
          />
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
