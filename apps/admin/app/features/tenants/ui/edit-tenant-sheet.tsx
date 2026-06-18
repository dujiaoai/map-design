import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  Button,
  Checkbox,
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

import {
  tenantTrialLabel,
  trialDateToEpochMs,
  trialEpochMsToDate,
} from '~/features/tenants/lib/tenant-lifecycle'
import { type AdminTenantSummary, patchAdminTenant } from '~/shared/api/admin-api'
import { AdminAntDate } from '~/shared/ant'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'

const schema = z.object({
  name: z.string().min(1, '请输入名称').max(128),
  plan: z.string().min(1, '请输入计划').max(32),
  status: z.enum(['active', 'suspended']),
  trialEndsAtDate: z.string(),
  clearTrialEndsAt: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function EditTenantSheet({
  tenant,
  open,
  onOpenChange,
}: {
  tenant: AdminTenantSummary | null
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
    defaultValues: {
      trialEndsAtDate: '',
      clearTrialEndsAt: false,
    },
  })

  const status = watch('status')
  const trialEndsAtDate = watch('trialEndsAtDate')
  const clearTrialEndsAt = watch('clearTrialEndsAt')
  const trialLabel = tenantTrialLabel(
    clearTrialEndsAt ? null : trialDateToEpochMs(trialEndsAtDate) ?? tenant?.trialEndsAt,
  )

  useEffect(() => {
    if (!tenant) return
    reset({
      name: tenant.name,
      plan: tenant.plan,
      status: tenant.status === 'suspended' ? 'suspended' : 'active',
      trialEndsAtDate: trialEpochMsToDate(tenant.trialEndsAt),
      clearTrialEndsAt: false,
    })
  }, [tenant, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: Parameters<typeof patchAdminTenant>[1] = {
        name: values.name.trim(),
        plan: values.plan.trim(),
        status: values.status,
      }
      if (values.clearTrialEndsAt) {
        payload.clearTrialEndsAt = true
      } else if (values.trialEndsAtDate.trim()) {
        const trialEndsAt = trialDateToEpochMs(values.trialEndsAtDate.trim())
        if (trialEndsAt != null) payload.trialEndsAt = trialEndsAt
      }
      return patchAdminTenant(tenant!.id, payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      if (tenant) {
        await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenant(tenant.id) })
      }
      onOpenChange(false)
      toast.success('租户已更新')
    },
  })

  function onSubmit(values: FormValues) {
    if (!tenant) return
    mutation.mutate(values)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">编辑租户</SheetTitle>
          <SheetDescription>{tenant?.slug ?? '—'}</SheetDescription>
        </SheetHeader>

        <form className="flex flex-1 flex-col gap-4 px-4" onSubmit={handleSubmit(onSubmit)}>
          <AdminField label="显示名" htmlFor="edit-tenant-name" error={errors.name?.message}>
            <Input id="edit-tenant-name" {...register('name')} />
          </AdminField>
          <AdminField label="计划" htmlFor="edit-tenant-plan" error={errors.plan?.message}>
            <Input id="edit-tenant-plan" {...register('plan')} placeholder="free / pro / enterprise" />
          </AdminField>
          <AdminField label="试用结束">
            <div className="space-y-2">
              <AdminAntDate
                id="edit-tenant-trial-ends"
                value={clearTrialEndsAt ? '' : trialEndsAtDate}
                onChange={(value) => {
                  setValue('trialEndsAtDate', value, { shouldDirty: true })
                  if (value) setValue('clearTrialEndsAt', false, { shouldDirty: true })
                }}
                placeholder="未设置试用截止"
                aria-label="试用结束日期"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-tenant-clear-trial"
                  checked={clearTrialEndsAt}
                  onCheckedChange={(checked) => {
                    const next = checked === true
                    setValue('clearTrialEndsAt', next, { shouldDirty: true })
                    if (next) setValue('trialEndsAtDate', '', { shouldDirty: true })
                  }}
                />
                <Label htmlFor="edit-tenant-clear-trial" className="text-sm font-normal">
                  清除试用截止
                </Label>
              </div>
              {trialLabel ? (
                <AdminStatusPill
                  level={trialLabel === '试用已到期' ? 'warn' : 'info'}
                  label={trialLabel}
                />
              ) : null}
            </div>
          </AdminField>
          <AdminField label="状态">
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as FormValues['status'])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="suspended">已停用</SelectItem>
              </SelectContent>
            </Select>
          </AdminField>
          <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={!tenant || isSubmitting || mutation.isPending}>
              {mutation.isPending ? '保存中…' : '保存更改'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
