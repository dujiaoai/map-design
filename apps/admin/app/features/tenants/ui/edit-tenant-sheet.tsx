import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  Button,
  cn,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  toast,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangleIcon, SparklesIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  applyTrialPreset,
  inferTrialPresetFromEndsAt,
  planOptionsForTenant,
  resolveEditTrialPatch,
  TENANT_TRIAL_PRESETS,
} from '~/features/tenants/lib/tenant-create-options'
import { EditTenantPreview } from '~/features/tenants/ui/edit-tenant-preview'
import { TenantProductPicker } from '~/features/tenants/ui/tenant-product-picker'
import { fetchAdminProducts, patchAdminTenant, type AdminTenantSummary } from '~/shared/api/admin-api'
import { AdminAntDate } from '~/shared/ant'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z
  .object({
    name: z.string().min(1, '请输入名称').max(128),
    plan: z.string().min(1, '请选择计划').max(32),
    productCode: z.string().min(1, '请选择产品线').max(64),
    status: z.enum(['active', 'suspended']),
    trialPreset: z.enum(['none', '14d', '30d', 'custom']),
    trialEndsAtDate: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.trialPreset === 'custom' && !values.trialEndsAtDate.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['trialEndsAtDate'],
        message: '请选择试用截止日',
      })
    }
  })

type FormValues = z.infer<typeof schema>

function buildDefaultValues(tenant: AdminTenantSummary): FormValues {
  const { preset, customDate } = inferTrialPresetFromEndsAt(tenant.trialEndsAt)
  return {
    name: tenant.name,
    plan: tenant.plan,
    productCode: tenant.productCode ?? 'map-design',
    status: tenant.status === 'suspended' ? 'suspended' : 'active',
    trialPreset: preset,
    trialEndsAtDate: customDate,
  }
}

const STATUS_OPTIONS = [
  { value: 'active' as const, label: '正常', description: '成员可登录并使用服务' },
  { value: 'suspended' as const, label: '已停用', description: '暂停访问，数据保留' },
]

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
  const productsQuery = useQuery({
    queryKey: adminQueryKeys.products,
    queryFn: fetchAdminProducts,
  })
  const products = productsQuery.data?.products ?? []
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      name: '',
      plan: 'free',
      productCode: 'map-design',
      status: 'active',
      trialPreset: 'none',
      trialEndsAtDate: '',
    },
  })

  const nameValue = watch('name')
  const planValue = watch('plan')
  const productCodeValue = watch('productCode')
  const statusValue = watch('status')
  const trialPreset = watch('trialPreset')
  const trialEndsAtDate = watch('trialEndsAtDate')
  const planOptions = tenant ? planOptionsForTenant(tenant.plan) : []
  const suspending =
    tenant?.status !== 'suspended' && statusValue === 'suspended'

  useEffect(() => {
    if (!tenant || !open) return
    reset(buildDefaultValues(tenant))
  }, [tenant, open, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const trialPatch = resolveEditTrialPatch(values.trialPreset, values.trialEndsAtDate)
      return patchAdminTenant(tenant!.id, {
        name: values.name.trim(),
        plan: values.plan.trim(),
        productCode: values.productCode.trim(),
        status: values.status,
        ...trialPatch,
      })
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

  function requestClose() {
    if (mutation.isPending) return
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) requestClose()
      }}
    >
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b border-border/50 px-4 pb-4">
          <p className="admin-display text-[10px] tracking-[0.22em] text-primary/75 uppercase">
            Tenant Registry
          </p>
          <SheetTitle className="admin-display text-xl">编辑租户</SheetTitle>
          <SheetDescription>
            更新组织档案、订阅计划与生命周期；Slug 创建后不可修改。
          </SheetDescription>
        </SheetHeader>

        {tenant ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="admin-scroll-area flex-1 space-y-5 px-4 py-5">
              <EditTenantPreview
                tenant={tenant}
                name={nameValue}
                plan={planValue}
                productLabel={
                  products.find((product) => product.code === productCodeValue)?.name ??
                  productCodeValue
                }
                status={statusValue}
                trialPreset={trialPreset}
                trialEndsAtDate={trialEndsAtDate}
              />

              <section className="space-y-4">
                <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  组织身份
                </h3>
                <AdminField label="显示名" htmlFor="edit-tenant-name" error={errors.name?.message}>
                  <Input
                    id="edit-tenant-name"
                    placeholder="例如：Acme Corp"
                    autoComplete="organization"
                    {...register('name')}
                  />
                </AdminField>
                <AdminField label="Slug（只读）" htmlFor="edit-tenant-slug">
                  <Input
                    id="edit-tenant-slug"
                    className="font-mono"
                    value={tenant.slug}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    用于登录域与 API 路径，创建后不可修改。
                  </p>
                </AdminField>
              </section>

              <section className="space-y-4">
                <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  所属产品线
                </h3>
                <TenantProductPicker
                  control={control}
                  name="productCode"
                  products={products}
                  disabled={productsQuery.isLoading}
                />
                {errors.productCode?.message ? (
                  <p className="text-xs text-destructive">{errors.productCode.message}</p>
                ) : null}
              </section>

              <section className="space-y-4">
                <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  订阅计划
                </h3>
                <Controller
                  name="plan"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {planOptions.map((option) => {
                        const selected = field.value === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              'admin-create-plan-chip relative z-10 cursor-pointer rounded-xl border px-3 py-3 text-left transition-all',
                              selected
                                ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
                                : 'border-border/50 bg-background/20 hover:border-primary/25',
                            )}
                          >
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                              {option.description}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
                {errors.plan?.message ? (
                  <p className="text-xs text-destructive">{errors.plan.message}</p>
                ) : null}
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="size-3.5 text-primary" aria-hidden />
                  <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    试用周期
                  </h3>
                </div>
                <Controller
                  name="trialPreset"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {TENANT_TRIAL_PRESETS.map((preset) => {
                        const selected = field.value === preset.value
                        return (
                          <button
                            key={preset.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              field.onChange(preset.value)
                              applyTrialPreset(preset.value, setValue, planValue)
                            }}
                            className={cn(
                              'admin-create-trial-chip relative z-10 cursor-pointer rounded-lg border px-3 py-2.5 text-left transition-all',
                              selected
                                ? 'border-primary/35 bg-primary/8 ring-1 ring-primary/20'
                                : 'border-border/50 hover:border-primary/20',
                            )}
                          >
                            <p className="text-sm font-medium">{preset.label}</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">{preset.hint}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
                {trialPreset === 'custom' ? (
                  <Controller
                    name="trialEndsAtDate"
                    control={control}
                    render={({ field }) => (
                      <AdminField label="试用截止日" error={errors.trialEndsAtDate?.message}>
                        <AdminAntDate
                          id="edit-tenant-trial-ends"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="选择试用结束日期"
                          aria-label="试用截止日"
                        />
                      </AdminField>
                    )}
                  />
                ) : null}
              </section>

              <section className="space-y-4">
                <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  访问状态
                </h3>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {STATUS_OPTIONS.map((option) => {
                        const selected = field.value === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              'admin-create-plan-chip relative z-10 cursor-pointer rounded-xl border px-3 py-3 text-left transition-all',
                              selected
                                ? option.value === 'suspended'
                                  ? 'border-destructive/40 bg-destructive/8 ring-1 ring-destructive/25'
                                  : 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
                                : 'border-border/50 bg-background/20 hover:border-primary/25',
                            )}
                          >
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                              {option.description}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
                {suspending ? (
                  <div
                    className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-xs text-destructive"
                    role="alert"
                  >
                    <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <p>
                      停用后该租户成员将无法登录，API 访问也会被拒绝。可随时恢复为「正常」。
                    </p>
                  </div>
                ) : null}
              </section>

              <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
            </div>

            <SheetFooter className="shrink-0 gap-2 border-t border-border/50 px-4 py-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={requestClose}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting || mutation.isPending}
              >
                {mutation.isPending ? '保存中…' : '保存更改'}
              </Button>
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
