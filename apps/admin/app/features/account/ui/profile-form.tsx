import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import type { Session } from '@repo/auth'
import { Button, Input, toast } from '@repo/ui'
import { useMutation } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import {
  profileFormSchema,
  type ProfileFormValues,
} from '~/features/account/model/account-schemas'
import { updateAccountProfile } from '~/shared/api/admin-api'
import { auth } from '~/shared/auth/client'
import { formatProfileUpdateError } from '~/shared/lib/format-account-error'

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

export function ProfileForm({ session }: { session: Session }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: standardSchemaResolver(profileFormSchema),
    defaultValues: {
      name: session.user.name ?? '',
      phone: session.user.phone ?? '',
      avatarUrl: session.user.avatarUrl ?? '',
    },
  })

  useEffect(() => {
    reset({
      name: session.user.name ?? '',
      phone: session.user.phone ?? '',
      avatarUrl: session.user.avatarUrl ?? '',
    })
  }, [session, reset])

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
      toast.success('资料已更新')
    },
  })

  const submitError = mutation.isError ? formatProfileUpdateError(mutation.error) : null

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit((v) => mutation.mutate(v))(event)}>
      <FormField label="显示名" error={errors.name?.message}>
        <Input maxLength={128} {...register('name')} />
      </FormField>
      <FormField label="手机号" error={errors.phone?.message}>
        <Input maxLength={32} autoComplete="tel" {...register('phone')} />
      </FormField>
      <FormField label="头像 URL" error={errors.avatarUrl?.message}>
        <Input maxLength={512} placeholder="https://…" {...register('avatarUrl')} />
      </FormField>
      <FormField label="邮箱">
        <Input readOnly type="email" value={session.user.email} />
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
