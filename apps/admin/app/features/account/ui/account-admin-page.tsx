import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useSession } from '@repo/auth'
import { Button, Input } from '@repo/ui'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  profileFormSchema,
  resetPasswordSchema,
  type ProfileFormValues,
  type ResetPasswordFormValues,
} from '~/features/account/model/account-schemas'
import { updateAccountPassword, updateAccountProfile } from '~/shared/api/admin-api'
import { auth } from '~/shared/auth/client'
import {
  formatPasswordChangeError,
  formatProfileUpdateError,
} from '~/shared/lib/format-account-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { PasswordInput } from '~/shared/ui/password-input'

export function AccountAdminPage() {
  const session = useSession()
  if (!session) return null

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="账号设置"
        description="修改显示名与登录密码。"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel className="p-5">
          <ProfileSection
            email={session.user.email}
            sessionAvatarUrl={session.user.avatarUrl ?? ''}
            sessionName={session.user.name ?? ''}
            sessionPhone={session.user.phone ?? ''}
          />
        </AdminPanel>
        <AdminPanel className="p-5">
          <PasswordSection />
        </AdminPanel>
      </div>
    </div>
  )
}

function ProfileSection({
  sessionName,
  sessionPhone,
  sessionAvatarUrl,
  email,
}: {
  sessionName: string
  sessionPhone: string
  sessionAvatarUrl: string
  email: string
}) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: standardSchemaResolver(profileFormSchema),
    defaultValues: {
      name: sessionName,
      phone: sessionPhone,
      avatarUrl: sessionAvatarUrl,
    },
  })

  useEffect(() => {
    reset({
      name: sessionName,
      phone: sessionPhone,
      avatarUrl: sessionAvatarUrl,
    })
  }, [sessionAvatarUrl, sessionName, sessionPhone, reset])

  const mutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const updated = await updateAccountProfile({
        name: values.name.trim(),
        phone: values.phone?.trim() || null,
        avatarUrl: values.avatarUrl?.trim() || null,
      })
      const accessToken = auth.getAccessToken()
      const refreshToken = auth.getRefreshToken()
      if (accessToken && refreshToken) {
        auth.setSession(updated, { accessToken, refreshToken })
      }
      return updated
    },
    onSuccess: () => {
      setSuccessMessage('显示名已更新')
    },
  })

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit((v) => mutation.mutate(v))(event)}>
      <h2 className="admin-display text-lg font-semibold">个人资料</h2>
      <AdminField label="显示名" htmlFor="profile-name" error={errors.name?.message}>
        <Input id="profile-name" maxLength={128} {...register('name')} />
      </AdminField>
      <AdminField label="手机号" htmlFor="profile-phone" error={errors.phone?.message}>
        <Input id="profile-phone" maxLength={32} autoComplete="tel" {...register('phone')} />
      </AdminField>
      <AdminField label="头像 URL" htmlFor="profile-avatar" error={errors.avatarUrl?.message}>
        <Input id="profile-avatar" maxLength={512} placeholder="https://…" {...register('avatarUrl')} />
      </AdminField>
      <AdminField label="邮箱">
        <Input readOnly type="email" value={email} />
      </AdminField>
      {successMessage ? <p className="text-sm text-primary">{successMessage}</p> : null}
      <AdminFormError message={mutation.isError ? formatProfileUpdateError(mutation.error) : null} />
      <Button type="submit" disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? '保存中…' : '保存资料'}
      </Button>
    </form>
  )
}

function PasswordSection() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
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
      setSuccessMessage('密码已更新，请使用新密码重新登录')
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => void handleSubmit((v) => mutation.mutate(v))(event)}
    >
      <h2 className="admin-display text-lg font-semibold">修改密码</h2>
      <AdminField label="当前密码" htmlFor="old-password" error={errors.oldPassword?.message}>
        <PasswordInput id="old-password" autoComplete="current-password" {...register('oldPassword')} />
      </AdminField>
      <AdminField label="新密码" htmlFor="new-password" error={errors.newPassword?.message}>
        <PasswordInput id="new-password" autoComplete="new-password" {...register('newPassword')} />
      </AdminField>
      <AdminField label="确认新密码" htmlFor="confirm-password" error={errors.confirmPassword?.message}>
        <PasswordInput id="confirm-password" autoComplete="new-password" {...register('confirmPassword')} />
      </AdminField>
      {successMessage ? <p className="text-sm text-primary">{successMessage}</p> : null}
      <AdminFormError message={mutation.isError ? formatPasswordChangeError(mutation.error) : null} />
      <Button type="submit" disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? '提交中…' : '更新密码'}
      </Button>
    </form>
  )
}
