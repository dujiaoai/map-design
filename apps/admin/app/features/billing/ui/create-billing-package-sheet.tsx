import {
  Button,
  Input,
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
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'

import { adminPackageSchema } from '~/features/billing/lib/billing-admin-api'
import {
  defaultPackageFormState,
  parsePackageFormState,
  type PackageFormState,
} from '~/features/billing/lib/billing-package-form'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

export function CreateBillingPackageSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const codeInputId = useId()
  const pointsInputId = useId()
  const priceInputId = useId()
  const currencyInputId = useId()
  const sortOrderInputId = useId()

  const [form, setForm] = useState<PackageFormState>(defaultPackageFormState)

  useEffect(() => {
    if (!open) setForm(defaultPackageFormState)
  }, [open])

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = parsePackageFormState(form, 'create')
      return adminPackageSchema.parse(await billingAdminApi.post('/packages', payload))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...billingAdminQueryKeys.all, 'packages'],
      })
      onOpenChange(false)
    },
  })

  const formError = mutation.error ? formatAdminApiError(mutation.error) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="admin-display text-lg">新建 SKU</SheetTitle>
          <SheetDescription>创建充值套餐；代码创建后不可修改。</SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col gap-4 px-4"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate()
          }}
        >
          <AdminField label="代码" htmlFor={codeInputId}>
            <Input
              id={codeInputId}
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              placeholder="starter_500"
              required
            />
          </AdminField>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="积分" htmlFor={pointsInputId}>
              <Input
                id={pointsInputId}
                type="number"
                min={1}
                value={form.points}
                onChange={(event) => setForm((prev) => ({ ...prev, points: event.target.value }))}
                required
              />
            </AdminField>
            <AdminField label="售价（分）" htmlFor={priceInputId}>
              <Input
                id={priceInputId}
                type="number"
                min={1}
                value={form.priceCents}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, priceCents: event.target.value }))
                }
                required
              />
            </AdminField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="币种" htmlFor={currencyInputId}>
              <Input
                id={currencyInputId}
                value={form.currency}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, currency: event.target.value }))
                }
              />
            </AdminField>
            <AdminField label="排序" htmlFor={sortOrderInputId}>
              <Input
                id={sortOrderInputId}
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sortOrder: event.target.value }))
                }
              />
            </AdminField>
          </div>
          <AdminField label="状态">
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, status: value ?? 'active' }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">上架</SelectItem>
                <SelectItem value="inactive">下架</SelectItem>
              </SelectContent>
            </Select>
          </AdminField>
          <AdminFormError message={formError} />
          <SheetFooter className="px-0">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? '创建中…' : '创建 SKU'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
