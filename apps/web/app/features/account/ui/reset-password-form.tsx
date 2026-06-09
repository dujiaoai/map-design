import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button } from '@repo/ui'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '~/features/account/model/account-schemas'
import { useUpdateUserPasswordMutation } from '~/features/account/model/use-account-mutations'
import { formatPasswordChangeError } from '~/shared/auth/format-account-error'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'
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
  const saasAccountEnabled = usesSaasSessionBootstrap()
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
    setSuccessMessage('密码已更新；refresh token 已失效，下次请用新密码登录')
  }

  const submitError = mutation.isError ? formatPasswordChangeError(mutation.error) : null

  if (!saasAccountEnabled) {
    return (
      <p className="text-muted-foreground text-sm leading-relaxed">
        开发 mock 模式不支持改密。请配置 <code>VITE_API_URL</code> 并使用 SaaS 账号登录后再试。
      </p>
    )
  }

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
