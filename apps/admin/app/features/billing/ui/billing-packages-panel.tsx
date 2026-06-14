import { Button } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'

import {
  adminPackageListSchema,
  type AdminPackage,
} from '~/features/billing/lib/billing-admin-api'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
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
  onEditPackage,
}: {
  canWrite?: boolean
  onEditPackage?: (pkg: AdminPackage | null) => void
}) {
  const query = useQuery({
    queryKey: ['admin', 'billing', 'packages'],
    queryFn: async () =>
      adminPackageListSchema.parse(await billingAdminApi.get('/packages')),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <AdminPanel>
      <div className="border-b border-border/60 px-6 py-5">
        <h3 className="text-base font-medium">充值 SKU</h3>
        <p className="mt-1 text-sm text-muted-foreground">平台价目表（含 inactive）。</p>
      </div>
      <div className="px-2 py-2">
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditPackage?.(pkg)}
                      >
                        编辑
                      </Button>
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
