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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SparklesIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'

import {
  applyTrialPreset,
  resolveCreateTrialEndsAt,
  TENANT_PLAN_OPTIONS,
  TENANT_TRIAL_PRESETS,
} from '~/features/tenants/lib/tenant-create-options'
import { suggestTenantSlug } from '~/features/tenants/lib/tenant-slug'
import { CreateTenantPreview } from '~/features/tenants/ui/create-tenant-preview'
import { createAdminTenant } from '~/shared/api/admin-api'
import { AdminAntDate } from '~/shared/ant'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z
  .object({
    name: z.string().min(1, '请输入名称').max(128),
    slug: z
      .string()
      .min(1, '请输入 slug')
      .max(64)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, '仅小写字母、数字与连字符'),
    plan: z.string().min(1, '请选择计划').max(32),
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

const DEFAULT_VALUES: FormValues = {
  name: '',
  slug: '',
  plan: 'free',
  trialPreset: 'none',
  trialEndsAtDate: '',
}

export function CreateTenantSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const slugTouchedRef = useRef(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: DEFAULT_VALUES,
  })

  const nameValue = watch('name')
  const slugValue = watch('slug')
  const planValue = watch('plan')
  const trialPreset = watch('trialPreset')
  const trialEndsAtDate = watch('trialEndsAtDate')

  useEffect(() => {
    if (!open) {
      slugTouchedRef.current = false
      reset(DEFAULT_VALUES)
    }
  }, [open, reset])

  useEffect(() => {
    if (slugTouchedRef.current) return
    const suggested = suggestTenantSlug(nameValue)
    if (suggested) {
      setValue('slug', suggested, { shouldValidate: Boolean(nameValue.trim()) })
    }
  }, [nameValue, setValue])

  const mutation = useMutation({
    mutationFn: createAdminTenant,
    onSuccess: async (tenant) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats }),
      ])
      reset(DEFAULT_VALUES)
      slugTouchedRef.current = false
      onOpenChange(false)
      toast.success(`租户「${tenant.name}」已创建`)
      navigate(`/tenants/${tenant.id}`)
    },
  })

  function onSubmit(values: FormValues) {
    const trialEndsAt = resolveCreateTrialEndsAt(values.trialPreset, values.trialEndsAtDate)
    mutation.mutate({
      name: values.name.trim(),
      slug: values.slug.trim(),
      plan: values.plan.trim(),
      ...(trialEndsAt != null ? { trialEndsAt } : {}),
    })
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
          <SheetTitle className="admin-display text-xl">新建租户</SheetTitle>
          <SheetDescription>
            登记组织档案并配置订阅计划；创建后可立即邀请成员或配置 SSO。
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="admin-scroll-area flex-1 space-y-5 px-4 py-5">
            <CreateTenantPreview
              name={nameValue}
              slug={slugValue}
              plan={planValue}
              trialPreset={trialPreset}
              trialEndsAtDate={trialEndsAtDate}
            />

            <section className="space-y-4">
              <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                组织身份
              </h3>
              <AdminField label="显示名" htmlFor="tenant-name" error={errors.name?.message}>
                <Input
                  id="tenant-name"
                  placeholder="例如：Acme Corp"
                  autoComplete="organization"
                  {...register('name')}
                />
              </AdminField>
              <AdminField label="Slug" htmlFor="tenant-slug" error={errors.slug?.message}>
                <div className="flex gap-2">
                  <Input
                    id="tenant-slug"
                    className="font-mono"
                    placeholder="acme-corp"
                    {...register('slug', {
                      onChange: () => {
                        slugTouchedRef.current = true
                      },
                    })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={!nameValue.trim()}
                    onClick={() => {
                      slugTouchedRef.current = false
                      const suggested = suggestTenantSlug(nameValue)
                      if (suggested) {
                        setValue('slug', suggested, { shouldDirty: true, shouldValidate: true })
                      }
                    }}
                  >
                    同步
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  用于登录域与 API 路径，创建后不可修改。
                </p>
              </AdminField>
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
                    {TENANT_PLAN_OPTIONS.map((option) => {
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
                        id="tenant-trial-ends"
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
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? '创建中…' : '创建并进入详情'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
