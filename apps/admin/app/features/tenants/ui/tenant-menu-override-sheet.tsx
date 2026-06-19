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
import { LayoutListIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  MENU_OVERRIDE_ENABLED_OPTIONS,
  MENU_OVERRIDE_ITEM_PRESETS,
  resolveMenuOverrideEnabled,
} from '~/features/tenants/lib/menu-override-options'
import { MenuOverridePreview } from '~/features/tenants/ui/menu-override-preview'
import type { TenantMenuOverride } from '~/entities/tenant/model'
import {
  deleteTenantMenuOverride,
  fetchTenantMenuDiff,
  putTenantMenuOverride,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  itemId: z.string().min(1, '请输入菜单项 ID').max(64),
  enabled: z.enum(['inherit', 'true', 'false']),
  title: z.string().max(128),
  sortOrder: z.string().max(8),
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
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { itemId: '', enabled: 'inherit', title: '', sortOrder: '' },
  })

  const itemIdValue = watch('itemId')
  const enabledValue = watch('enabled')
  const titleValue = watch('title')
  const sortOrderValue = watch('sortOrder')

  const diffQuery = useQuery({
    queryKey: adminQueryKeys.tenantMenuDiff(tenantId),
    queryFn: () => fetchTenantMenuDiff(tenantId),
    enabled: open,
  })

  const diffEntries = diffQuery.data?.entries
  const suggestionIds = diffEntries?.map((entry) => entry.itemId) ?? []

  useEffect(() => {
    if (!open) return
    reset({
      itemId: override?.itemId ?? '',
      enabled: resolveMenuOverrideEnabled(override?.enabled),
      title: override?.title ?? '',
      sortOrder: override?.sortOrder == null ? '' : String(override.sortOrder),
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
      const sortOrderRaw = values.sortOrder.trim()
      if (sortOrderRaw) {
        const sortOrder = Number(sortOrderRaw)
        if (!Number.isFinite(sortOrder)) {
          throw new Error('排序须为数字')
        }
        payload.sortOrder = sortOrder
      } else {
        payload.sortOrder = null
      }
      return putTenantMenuOverride(tenantId, payload)
    },
    onSuccess: async () => {
      toast.success('菜单覆盖已保存')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantMenuOverrides(tenantId) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantMenuDiff(tenantId) }),
      ])
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantMenuOverrides(tenantId) }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenantMenuDiff(tenantId) }),
      ])
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(formatAdminApiError(error, '删除菜单覆盖失败'))
    },
  })

  function onSubmit(values: FormValues) {
    saveMutation.mutate(values)
  }

  function requestClose() {
    if (saveMutation.isPending || deleteMutation.isPending) return
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
            Menu Override
          </p>
          <SheetTitle className="admin-display text-xl">
            {override ? '编辑菜单覆盖' : '新增菜单覆盖'}
          </SheetTitle>
          <SheetDescription>
            相对平台模板写入单条 diff；留空字段表示继承模板默认值。
          </SheetDescription>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="admin-scroll-area flex-1 space-y-5 px-4 py-5">
            <MenuOverridePreview
              itemId={itemIdValue}
              enabled={enabledValue}
              title={titleValue}
              sortOrder={sortOrderValue}
              diffEntries={diffEntries}
            />

            <section className="space-y-4">
              <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                目标菜单项
              </h3>
              <AdminField label="菜单项 ID" error={errors.itemId?.message}>
                <Input
                  {...register('itemId')}
                  list="menu-override-item-suggestions"
                  placeholder="tool-measure-distance"
                  disabled={Boolean(override) || isSubmitting}
                  className="font-mono text-xs"
                  aria-label="菜单项 ID"
                />
                <datalist id="menu-override-item-suggestions">
                  {suggestionIds.map((id) => (
                    <option key={id} value={id} />
                  ))}
                </datalist>
                {!override ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {MENU_OVERRIDE_ITEM_PRESETS.map((preset) => (
                      <button
                        key={preset.itemId}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          setValue('itemId', preset.itemId, { shouldDirty: true, shouldValidate: true })
                        }
                        className="admin-menu-override-preset rounded-md border border-border/50 px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </AdminField>
            </section>

            <section className="space-y-4">
              <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                启用状态
              </h3>
              <Controller
                name="enabled"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    {MENU_OVERRIDE_ENABLED_OPTIONS.map((option) => {
                      const selected = field.value === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          disabled={isSubmitting}
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            'admin-menu-override-enabled-chip relative z-10 cursor-pointer rounded-xl border px-3 py-3 text-left transition-all',
                            selected
                              ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
                              : 'border-border/50 bg-background/20 hover:border-primary/25',
                          )}
                        >
                          <p className="text-sm font-medium">{option.label}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                            {option.hint}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </section>

            <section className="space-y-4">
              <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                展示与排序
              </h3>
              <AdminField label="覆盖标题" error={errors.title?.message}>
                <Input
                  {...register('title')}
                  placeholder="留空表示继承模板标题"
                  disabled={isSubmitting}
                  aria-label="覆盖标题"
                />
              </AdminField>
              <AdminField label="覆盖 sortOrder" error={errors.sortOrder?.message}>
                <Input
                  {...register('sortOrder')}
                  placeholder="留空表示继承模板排序"
                  disabled={isSubmitting}
                  className="font-mono text-xs"
                  aria-label="覆盖 sortOrder"
                  inputMode="numeric"
                />
              </AdminField>
            </section>

            <AdminFormError
              message={
                saveMutation.isError
                  ? formatAdminApiError(saveMutation.error)
                  : deleteMutation.isError
                    ? formatAdminApiError(deleteMutation.error)
                    : null
              }
            />
          </div>

          <SheetFooter className="shrink-0 gap-2 border-t border-border/50 px-4 py-4 sm:justify-between">
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
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <LayoutListIcon className="size-3.5" aria-hidden />
                单条 diff
              </span>
            )}
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={saveMutation.isPending || deleteMutation.isPending}
                onClick={requestClose}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || saveMutation.isPending || deleteMutation.isPending}
              >
                {saveMutation.isPending ? '保存中…' : '保存覆盖'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
