import { Button } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  adminPackageListSchema,
  adminPackageSchema,
  type AdminPackage,
} from '~/features/billing/lib/billing-admin-api'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminFormError } from '~/shared/ui/admin-field'
import {
  AdminDataTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminStatusBadge } from '~/shared/ui/admin-status-badge'

function formatPrice(cents: number, currency: string) {
  if (currency === 'CNY') {
    return `¥${(cents / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  }
  return `${cents} ${currency}`
}

export function BillingPackagesPanel({
  canWrite = false,
  onCreatePackage,
  onEditPackage,
}: {
  canWrite?: boolean
  onCreatePackage?: () => void
  onEditPackage?: (pkg: AdminPackage) => void
}) {
  const queryClient = useQueryClient()
  const [deactivatingCode, setDeactivatingCode] = useState<string | null>(null)

  const query = useQuery({
    queryKey: billingAdminQueryKeys.packages(),
    queryFn: async () =>
      adminPackageListSchema.parse(await billingAdminApi.get('/packages')),
  })

  const deactivateMutation = useMutation({
    mutationFn: async (pkg: AdminPackage) => {
      setDeactivatingCode(pkg.code)
      return adminPackageSchema.parse(
        await billingAdminApi.patch(`/packages/${encodeURIComponent(pkg.code)}`, {
          status: 'inactive',
        }),
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.packages() })
    },
    onSettled: () => {
      setDeactivatingCode(null)
    },
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null
  const actionError = deactivateMutation.error
    ? formatAdminApiError(deactivateMutation.error)
    : null

  return (
    <AdminPanel>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 px-6 py-5">
        <div>
          <h3 className="text-base font-medium">充值 SKU</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            平台价目表（含 inactive）；下架后前台不再展示，历史订单不受影响。
          </p>
        </div>
        {canWrite && onCreatePackage ? (
          <Button type="button" size="sm" onClick={onCreatePackage}>
            新建 SKU
          </Button>
        ) : null}
      </div>
      <div className="px-2 py-2">
        {actionError ? (
          <div className="px-4 pb-2">
            <AdminFormError message={actionError} />
          </div>
        ) : null}
        {query.isLoading ? (
          <AdminEmptyState message="加载 SKU…" />
        ) : errorMessage ? (
          <AdminEmptyState message={errorMessage} />
        ) : query.data && query.data.items.length === 0 ? (
          <AdminEmptyState message="暂无 SKU。" />
        ) : query.data ? (
          <AdminDataTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeaderCell>代码</AdminTableHeaderCell>
                <AdminTableHeaderCell>积分</AdminTableHeaderCell>
                <AdminTableHeaderCell>售价</AdminTableHeaderCell>
                <AdminTableHeaderCell>状态</AdminTableHeaderCell>
                <AdminTableHeaderCell>排序</AdminTableHeaderCell>
                {canWrite ? <AdminTableHeaderCell>操作</AdminTableHeaderCell> : null}
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {query.data.items.map((pkg) => (
                <AdminTableRow key={pkg.id}>
                  <AdminTableCell mono>{pkg.code}</AdminTableCell>
                  <AdminTableCell>{pkg.points}</AdminTableCell>
                  <AdminTableCell>{formatPrice(pkg.priceCents, pkg.currency)}</AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge status={pkg.status} />
                  </AdminTableCell>
                  <AdminTableCell>{pkg.sortOrder}</AdminTableCell>
                  {canWrite ? (
                    <AdminTableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onEditPackage?.(pkg)}
                        >
                          编辑
                        </Button>
                        {pkg.status === 'active' ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={deactivateMutation.isPending}
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `确定下架 SKU「${pkg.code}」？前台充值页将不再展示该套餐。`,
                                )
                              ) {
                                return
                              }
                              deactivateMutation.mutate(pkg)
                            }}
                          >
                            {deactivatingCode === pkg.code && deactivateMutation.isPending
                              ? '下架中…'
                              : '下架'}
                          </Button>
                        ) : null}
                      </div>
                    </AdminTableCell>
                  ) : null}
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminDataTable>
        ) : null}
      </div>
    </AdminPanel>
  )
}
