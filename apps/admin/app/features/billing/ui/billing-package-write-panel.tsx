import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useState } from 'react'

import {
  adminPackageSchema,
  type AdminPackage,
} from '~/features/billing/lib/billing-admin-api'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminPanel } from '~/shared/ui/admin-page-shell'

type PackageFormState = {
  code: string
  points: string
  priceCents: string
  currency: string
  status: string
  sortOrder: string
}

const defaultFormState: PackageFormState = {
  code: '',
  points: '',
  priceCents: '',
  currency: 'CNY',
  status: 'active',
  sortOrder: '0',
}

function parseFormState(form: PackageFormState, mode: 'create' | 'edit') {
  const points = Number(form.points)
  const priceCents = Number(form.priceCents)
  const sortOrder = Number(form.sortOrder)

  if (!Number.isFinite(points) || points < 1) {
    throw new Error('积分须为大于 0 的整数')
  }
  if (!Number.isFinite(priceCents) || priceCents < 1) {
    throw new Error('售价（分）须为大于 0 的整数')
  }
  if (!Number.isFinite(sortOrder)) {
    throw new Error('排序须为整数')
  }

  if (mode === 'create') {
    const code = form.code.trim()
    if (!code) throw new Error('SKU 代码不能为空')
    return {
      code,
      points,
      priceCents,
      currency: form.currency.trim() || 'CNY',
      status: form.status,
      sortOrder,
    }
  }

  return {
    points,
    priceCents,
    currency: form.currency.trim() || 'CNY',
    status: form.status,
    sortOrder,
  }
}

function packageToFormState(pkg: AdminPackage): PackageFormState {
  return {
    code: pkg.code,
    points: String(pkg.points),
    priceCents: String(pkg.priceCents),
    currency: pkg.currency,
    status: pkg.status,
    sortOrder: String(pkg.sortOrder),
  }
}

type BillingPackageWritePanelProps = {
  editingPackage: AdminPackage | null
  onEditPackageChange: (pkg: AdminPackage | null) => void
}

export function BillingPackageWritePanel({
  editingPackage,
  onEditPackageChange,
}: BillingPackageWritePanelProps) {
  const queryClient = useQueryClient()
  const codeInputId = useId()
  const pointsInputId = useId()
  const priceInputId = useId()
  const currencyInputId = useId()
  const sortOrderInputId = useId()

  const [createForm, setCreateForm] = useState<PackageFormState>(defaultFormState)
  const [editForm, setEditForm] = useState<PackageFormState>(
    editingPackage ? packageToFormState(editingPackage) : defaultFormState,
  )

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = parseFormState(createForm, 'create')
      return adminPackageSchema.parse(await billingAdminApi.post('/packages', payload))
    },
    onSuccess: () => {
      setCreateForm(defaultFormState)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'billing', 'packages'] })
    },
  })

  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!editingPackage) throw new Error('未选择 SKU')
      const payload = parseFormState(editForm, 'edit')
      return adminPackageSchema.parse(
        await billingAdminApi.patch(`/packages/${encodeURIComponent(editingPackage.code)}`, payload),
      )
    },
    onSuccess: () => {
      onEditPackageChange(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'billing', 'packages'] })
    },
  })

  const createError = createMutation.error ? formatAdminApiError(createMutation.error) : null
  const patchError = patchMutation.error ? formatAdminApiError(patchMutation.error) : null

  useEffect(() => {
    if (editingPackage) {
      setEditForm(packageToFormState(editingPackage))
    }
  }, [editingPackage])

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <AdminPanel>
        <div className="space-y-4 border-b border-border/60 px-6 py-5">
          <div>
            <h3 className="text-base font-medium">新建 SKU</h3>
            <p className="mt-1 text-sm text-muted-foreground">创建充值套餐；代码创建后不可修改。</p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              createMutation.mutate()
            }}
          >
            <AdminField label="代码" htmlFor={codeInputId}>
              <Input
                id={codeInputId}
                value={createForm.code}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, code: event.target.value }))
                }
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
                  value={createForm.points}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, points: event.target.value }))
                  }
                  required
                />
              </AdminField>
              <AdminField label="售价（分）" htmlFor={priceInputId}>
                <Input
                  id={priceInputId}
                  type="number"
                  min={1}
                  value={createForm.priceCents}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, priceCents: event.target.value }))
                  }
                  required
                />
              </AdminField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="币种" htmlFor={currencyInputId}>
                <Input
                  id={currencyInputId}
                  value={createForm.currency}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, currency: event.target.value }))
                  }
                />
              </AdminField>
              <AdminField label="排序" htmlFor={sortOrderInputId}>
                <Input
                  id={sortOrderInputId}
                  type="number"
                  value={createForm.sortOrder}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, sortOrder: event.target.value }))
                  }
                />
              </AdminField>
            </div>
            <AdminField label="状态">
              <Select
                value={createForm.status}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, status: value ?? 'active' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="inactive">inactive</SelectItem>
                </SelectContent>
              </Select>
            </AdminField>
            <AdminFormError message={createError} />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? '创建中…' : '创建 SKU'}
            </Button>
          </form>
        </div>
      </AdminPanel>

      {editingPackage ? (
        <AdminPanel>
          <div className="space-y-4 border-b border-border/60 px-6 py-5">
            <div>
              <h3 className="text-base font-medium">编辑 SKU</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                正在编辑 <span className="font-mono text-foreground">{editingPackage.code}</span>
              </p>
            </div>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                patchMutation.mutate()
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="积分" htmlFor={`${pointsInputId}-edit`}>
                  <Input
                    id={`${pointsInputId}-edit`}
                    type="number"
                    min={1}
                    value={editForm.points}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, points: event.target.value }))
                    }
                    required
                  />
                </AdminField>
                <AdminField label="售价（分）" htmlFor={`${priceInputId}-edit`}>
                  <Input
                    id={`${priceInputId}-edit`}
                    type="number"
                    min={1}
                    value={editForm.priceCents}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, priceCents: event.target.value }))
                    }
                    required
                  />
                </AdminField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="币种" htmlFor={`${currencyInputId}-edit`}>
                  <Input
                    id={`${currencyInputId}-edit`}
                    value={editForm.currency}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, currency: event.target.value }))
                    }
                  />
                </AdminField>
                <AdminField label="排序" htmlFor={`${sortOrderInputId}-edit`}>
                  <Input
                    id={`${sortOrderInputId}-edit`}
                    type="number"
                    value={editForm.sortOrder}
                    onChange={(event) =>
                      setEditForm((prev) => ({ ...prev, sortOrder: event.target.value }))
                    }
                  />
                </AdminField>
              </div>
              <AdminField label="状态">
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, status: value ?? 'active' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="inactive">inactive</SelectItem>
                  </SelectContent>
                </Select>
              </AdminField>
              <AdminFormError message={patchError} />
              <div className="flex gap-2">
                <Button type="submit" disabled={patchMutation.isPending}>
                  {patchMutation.isPending ? '保存中…' : '保存变更'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEditPackageChange(null)}
                >
                  取消
                </Button>
              </div>
            </form>
          </div>
        </AdminPanel>
      ) : null}
    </div>
  )
}
