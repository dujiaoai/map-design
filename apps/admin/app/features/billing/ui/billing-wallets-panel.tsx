import { Button, Input } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'

import {
  adminBillingWalletsQuery,
  adminWalletListSchema,
} from '~/features/billing/lib/billing-admin-api'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField } from '~/shared/ui/admin-field'
import {
  AdminDataTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'

const PAGE_SIZE = 20

export function BillingWalletsPanel() {
  const tenantIdInputId = useId()
  const userIdInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [filters, setFilters] = useState<{ tenantId?: string; userId?: string }>({})
  const [page, setPage] = useState(0)

  const query = useQuery({
    queryKey: billingAdminQueryKeys.wallets(filters, page),
    queryFn: async () =>
      adminWalletListSchema.parse(
        await billingAdminApi.get(
          `/wallets${adminBillingWalletsQuery({ ...filters, page, size: PAGE_SIZE })}`,
        ),
      ),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <AdminPanel>
      <div className="space-y-4 border-b border-border/60 px-6 py-5">
        <div>
          <h3 className="text-base font-medium">用户钱包</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            默认展示全平台钱包；可按租户或用户 UUID 缩小范围。
          </p>
        </div>
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(0)
            setFilters({
              tenantId: tenantId.trim() || undefined,
              userId: userId.trim() || undefined,
            })
          }}
        >
          <AdminField label="租户 ID" htmlFor={tenantIdInputId}>
            <Input
              id={tenantIdInputId}
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              placeholder="可选"
            />
          </AdminField>
          <AdminField label="用户 ID" htmlFor={userIdInputId}>
            <Input
              id={userIdInputId}
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="可选"
            />
          </AdminField>
          <div className="flex items-end gap-2">
            <Button type="submit">筛选</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTenantId('')
                setUserId('')
                setPage(0)
                setFilters({})
              }}
            >
              重置
            </Button>
          </div>
        </form>
      </div>
      <div className="px-2 py-2">
        {query.isLoading ? (
          <AdminEmptyState message="加载中…" />
        ) : errorMessage ? (
          <AdminEmptyState message={errorMessage} />
        ) : query.data && query.data.items.length === 0 ? (
          <AdminEmptyState message="未找到匹配钱包。" />
        ) : query.data ? (
          <>
            <AdminDataTable>
              <AdminTableHead>
                <AdminTableRow>
                  <AdminTableHeaderCell>租户 ID</AdminTableHeaderCell>
                  <AdminTableHeaderCell>用户 ID</AdminTableHeaderCell>
                  <AdminTableHeaderCell>可用积分</AdminTableHeaderCell>
                  <AdminTableHeaderCell>冻结</AdminTableHeaderCell>
                  <AdminTableHeaderCell>余额</AdminTableHeaderCell>
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {query.data.items.map((wallet) => (
                  <AdminTableRow key={wallet.walletId}>
                    <AdminTableCell mono>{wallet.tenantId}</AdminTableCell>
                    <AdminTableCell mono>{wallet.userId}</AdminTableCell>
                    <AdminTableCell>{wallet.availableBalance}</AdminTableCell>
                    <AdminTableCell>{wallet.frozenBalance}</AdminTableCell>
                    <AdminTableCell>{wallet.balance}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminDataTable>
            <AdminTablePagination
              page={page + 1}
              pageSize={PAGE_SIZE}
              total={query.data.total}
              onPageChange={(nextPage) => setPage(nextPage - 1)}
            />
          </>
        ) : null}
      </div>
    </AdminPanel>
  )
}
