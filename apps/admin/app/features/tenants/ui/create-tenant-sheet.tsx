import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createAdminTenant } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  name: z.string().min(1, '请输入名称').max(128),
  slug: z
    .string()
    .min(1, '请输入 slug')
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '仅小写字母、数字与连字符'),
  plan: z.string().max(32).optional(),
})

type FormValues = z.infer<typeof schema>

export function CreateTenantSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: '', slug: '', plan: 'free' },
  })

  const mutation = useMutation({
    mutationFn: createAdminTenant,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      reset()
      onOpenChange(false)
    },
  })

  function onSubmit(values: FormValues) {
    mutation.mutate({
      name: values.name.trim(),
      slug: values.slug.trim(),
      plan: values.plan?.trim() || 'free',
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">新建租户</SheetTitle>
          <SheetDescription>创建后可邀请用户加入该租户。</SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col gap-4 px-4" onSubmit={handleSubmit(onSubmit)}>
          <AdminField label="显示名" htmlFor="tenant-name" error={errors.name?.message}>
            <Input id="tenant-name" placeholder="Acme Corp" {...register('name')} />
          </AdminField>
          <AdminField label="Slug" htmlFor="tenant-slug" error={errors.slug?.message}>
            <Input id="tenant-slug" className="font-mono" placeholder="acme" {...register('slug')} />
          </AdminField>
          <AdminField label="计划" htmlFor="tenant-plan" error={errors.plan?.message}>
            <Input id="tenant-plan" placeholder="free" {...register('plan')} />
          </AdminField>
          <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? '创建中…' : '创建租户'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
