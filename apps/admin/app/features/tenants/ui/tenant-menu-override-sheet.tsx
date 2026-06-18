import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  Button,
  Input,
  Label,
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
  toast,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { TenantMenuOverride } from '~/entities/tenant/model'
import { deleteTenantMenuOverride, putTenantMenuOverride } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  itemId: z.string().min(1, '请输入菜单项 ID').max(64),
  enabled: z.enum(['inherit', 'true', 'false']),
  title: z.string().max(128),
})

type FormValues = z.infer<typeof schema>

export function TenantMenuOverrideSheet({
  tenantId,
  override,
  open,
  onOpenChange,
}: {
  tenantId: string
  override: TenantMenuOverride | null
  open: boolean
  onOpenChange: (open: boolean) => void
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
    defaultValues: { itemId: '', enabled: 'inherit', title: '' },
  })

  const enabled = watch('enabled')

  useEffect(() => {
    if (!open) return
    reset({
      itemId: override?.itemId ?? '',
      enabled:
        override?.enabled == null ? 'inherit' : override.enabled ? 'true' : 'false',
      title: override?.title ?? '',
    })
  }, [open, override, reset])

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: Parameters<typeof putTenantMenuOverride>[1] = {
        itemId: values.itemId.trim(),
      }
      if (values.enabled === 'true') payload.enabled = true
      if (values.enabled === 'false') payload.enabled = false
      if (values.enabled === 'inherit') payload.enabled = null
      const title = values.title.trim()
      payload.title = title || null
      return putTenantMenuOverride(tenantId, payload)
    },
    onSuccess: async () => {
      toast.success('菜单覆盖已保存')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantMenuOverrides(tenantId) })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(formatAdminApiError(error, '保存菜单覆盖失败'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTenantMenuOverride(tenantId, override!.itemId),
    onSuccess: async () => {
      toast.success('已删除菜单覆盖')
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantMenuOverrides(tenantId) })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(formatAdminApiError(error, '删除菜单覆盖失败'))
    },
  })

  function onSubmit(values: FormValues) {
    saveMutation.mutate(values)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">
            {override ? '编辑菜单覆盖' : '新增菜单覆盖'}
          </SheetTitle>
          <SheetDescription>相对平台模板的单条 diff</SheetDescription>
        </SheetHeader>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AdminField label="菜单项 ID" error={errors.itemId?.message}>
            <Input
              {...register('itemId')}
              placeholder="tool-measure-distance"
              disabled={Boolean(override) || isSubmitting}
              className="font-mono text-xs"
              aria-label="菜单项 ID"
            />
          </AdminField>
          <AdminField label="启用状态">
            <Select
              value={enabled}
              onValueChange={(value) =>
                setValue('enabled', value as FormValues['enabled'], { shouldDirty: true })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger aria-label="覆盖启用状态">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit">继承模板</SelectItem>
                <SelectItem value="true">强制启用</SelectItem>
                <SelectItem value="false">强制禁用</SelectItem>
              </SelectContent>
            </Select>
          </AdminField>
          <AdminField label="覆盖标题" error={errors.title?.message}>
            <Input
              {...register('title')}
              placeholder="留空表示继承"
              disabled={isSubmitting}
              aria-label="覆盖标题"
            />
          </AdminField>
          <AdminFormError
            message={
              saveMutation.isError
                ? formatAdminApiError(saveMutation.error)
                : deleteMutation.isError
                  ? formatAdminApiError(deleteMutation.error)
                  : null
            }
          />
          <SheetFooter className="flex-col gap-2 px-0 sm:flex-row sm:justify-between">
            {override ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending || isSubmitting}
                onClick={() => void deleteMutation.mutate()}
              >
                删除覆盖
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" size="sm" disabled={isSubmitting || saveMutation.isPending}>
              保存
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
