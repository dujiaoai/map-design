import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import type { RuoYiUser } from '@haoxuan/ruoyi-api'
import { Button, Input } from '@haoxuan/ui'
import { useEffect, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'

import {
  profileFormSchema,
  type ProfileFormValues,
} from '~/features/account/model/account-schemas'
import { useUpdateUserProfileMutation } from '~/features/account/model/use-account-mutations'

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

function resolveSexValue(sex: string | null | undefined): ProfileFormValues['sex'] {
  return sex === '1' ? '1' : '0'
}

export function ProfileForm({ user }: { user: RuoYiUser }) {
  const mutation = useUpdateUserProfileMutation()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: standardSchemaResolver(profileFormSchema),
    defaultValues: {
      nickName: user.nickName ?? '',
      phonenumber: user.phonenumber ?? '',
      email: user.email ?? '',
      sex: resolveSexValue(user.sex),
    },
  })

  useEffect(() => {
    reset({
      nickName: user.nickName ?? '',
      phonenumber: user.phonenumber ?? '',
      email: user.email ?? '',
      sex: resolveSexValue(user.sex),
    })
  }, [user, reset])

  async function onSubmit(values: ProfileFormValues) {
    setSuccessMessage(null)
    await mutation.mutateAsync({ user, values })
    setSuccessMessage('修改成功')
  }

  const submitError =
    mutation.error instanceof Error ? mutation.error.message : mutation.isError ? '保存失败' : null

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <FormField label="用户姓名" error={errors.nickName?.message}>
        <Input maxLength={30} {...register('nickName')} />
      </FormField>

      <FormField label="手机号码" error={errors.phonenumber?.message}>
        <Input maxLength={11} {...register('phonenumber')} />
      </FormField>

      <FormField label="邮箱" error={errors.email?.message}>
        <Input maxLength={50} type="email" {...register('email')} />
      </FormField>

      <FormField label="性别" error={errors.sex?.message}>
        <div className="flex gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="0" {...register('sex')} />
            男
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="1" {...register('sex')} />
            女
          </label>
        </div>
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
