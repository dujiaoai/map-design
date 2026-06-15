import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button, toast } from '@repo/ui'
import { useMutation } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '~/features/account/model/account-schemas'
import { updateAccountPassword } from '~/shared/api/admin-api'
import { auth } from '~/shared/auth/client'
import { formatPasswordChangeError } from '~/shared/lib/format-account-error'
import { PasswordInput } from '~/shared/ui/password-input'

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-destructive text-xs">{message}</p>
}

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
      <FieldError message={error} />
    </div>
  )
}

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      updateAccountPassword(values.oldPassword, values.newPassword),
    onSuccess: () => {
      auth.clearRefreshToken()
      reset()
      toast.success('密码已更新', {
        description: 'Refresh token 已失效，下次请用新密码登录。',
      })
    },
  })

  const submitError = mutation.isError ? formatPasswordChangeError(mutation.error) : null

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit((v) => mutation.mutate(v))(event)}>
      <FormField label="旧密码" error={errors.oldPassword?.message}>
        <PasswordInput autoComplete="current-password" {...register('oldPassword')} />
      </FormField>
      <FormField label="新密码" error={errors.newPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('newPassword')} />
      </FormField>
      <FormField label="确认密码" error={errors.confirmPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
      </FormField>
      {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting || mutation.isPending}>
          {mutation.isPending ? '保存中…' : '保存'}
        </Button>
      </div>
    </form>
  )
}
