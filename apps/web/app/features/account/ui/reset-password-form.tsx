import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button } from '@haoxuan/ui'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '~/features/account/model/account-schemas'
import { useUpdateUserPasswordMutation } from '~/features/account/model/use-account-mutations'
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
  const mutation = useUpdateUserPasswordMutation()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setSuccessMessage(null)
    await mutation.mutateAsync({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    })
    reset()
    setSuccessMessage('修改成功')
  }

  const submitError =
    mutation.error instanceof Error ? mutation.error.message : mutation.isError ? '修改失败' : null

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <FormField label="旧密码" error={errors.oldPassword?.message}>
        <PasswordInput autoComplete="current-password" {...register('oldPassword')} />
      </FormField>

      <FormField label="新密码" error={errors.newPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('newPassword')} />
      </FormField>

      <FormField label="确认密码" error={errors.confirmPassword?.message}>
        <PasswordInput autoComplete="new-password" {...register('confirmPassword')} />
      </FormField>

      {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}
      {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting || mutation.isPending}>
          {mutation.isPending ? '保存中…' : '保存'}
        </Button>
      </div>
    </form>
  )
}
