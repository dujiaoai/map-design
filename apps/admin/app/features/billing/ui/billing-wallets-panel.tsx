import { Button, Input, cn } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useId, useState } from 'react'

import {
  adminBillingWalletsQuery,
  adminWalletListSchema,
} from '~/features/billing/lib/billing-admin-api'
import type { BillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { useBillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import type { BillingNavigateTarget } from '~/features/billing/lib/billing-admin-nav'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { validateOptionalUuidFilters } from '~/shared/lib/uuid'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import {
  AdminDataTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'

const PAGE_SIZE = 20
const LOW_BALANCE_THRESHOLD = 100

export function BillingWalletsPanel({
  filterSeed,
  onNavigate,
}: {
  filterSeed?: BillingFilterSeed
  onNavigate?: (target: BillingNavigateTarget) => void
}) {
  const tenantIdInputId = useId()
  const userIdInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [filters, setFilters] = useState<{ tenantId?: string; userId?: string }>({})
  const [page, setPage] = useState(0)
  const [filterError, setFilterError] = useState<string | null>(null)

  const applySeed = useCallback((seed: BillingFilterSeed) => {
    setTenantId(seed.tenantId ?? '')
    setUserId(seed.userId ?? '')
    setPage(0)
    setFilters({
      tenantId: seed.tenantId,
      userId: seed.userId,
    })
    setFilterError(null)
  }, [])

  useBillingFilterSeed(filterSeed, applySeed)

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

  function resetWalletFilters() {
    setTenantId('')
    setUserId('')
    setPage(0)
    setFilters({})
    setFilterError(null)
  }

  const hasWalletFilters = Boolean(filters.tenantId || filters.userId)

  return (
    <AdminPanel>
      <div className="space-y-4 border-b border-border/60 px-6 py-5">
        <div>
          <h3 className="text-base font-medium">用户钱包</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            全平台个人账户积分；可按租户 / 用户 UUID 筛选，支持跳转查看充值订单。
          </p>
        </div>
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            const nextTenantId = tenantId.trim() || undefined
            const nextUserId = userId.trim() || undefined
            const uuidError = validateOptionalUuidFilters({
              '租户 ID': nextTenantId,
              '用户 ID': nextUserId,
            })
            if (uuidError) {
              setFilterError(uuidError)
              return
            }
            setFilterError(null)
            setPage(0)
            setFilters({ tenantId: nextTenantId, userId: nextUserId })
          }}
        >
          <AdminField label="租户 ID" htmlFor={tenantIdInputId}>
            <Input
              id={tenantIdInputId}
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              placeholder="可选 UUID"
            />
          </AdminField>
          <AdminField label="用户 ID" htmlFor={userIdInputId}>
            <Input
              id={userIdInputId}
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="可选 UUID"
            />
          </AdminField>
          <div className="flex items-end gap-2">
            <Button type="submit">筛选</Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetWalletFilters}
            >
              重置
            </Button>
          </div>
        </form>
        {filterError ? (
          <AdminFormError message={filterError} />
        ) : null}
      </div>
      <div className="px-2 py-2">
        {query.isLoading ? (
          <AdminTableSkeleton columns={onNavigate ? 6 : 5} showPagination />
        ) : errorMessage ? (
          <AdminEmptyState
            message={errorMessage}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : query.data && query.data.items.length === 0 ? (
          hasWalletFilters ? (
            <AdminEmptyState
              message="未找到匹配钱包。"
              action={
                <Button type="button" variant="outline" size="sm" onClick={resetWalletFilters}>
                  清除筛选
                </Button>
              }
            />
          ) : (
            <AdminEmptyState message="暂无钱包。" />
          )
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
                  {onNavigate ? <AdminTableHeaderCell>操作</AdminTableHeaderCell> : null}
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {query.data.items.map((wallet) => {
                  const isLow = wallet.availableBalance < LOW_BALANCE_THRESHOLD
                  return (
                    <AdminTableRow key={wallet.walletId}>
                      <AdminTableCell>
                        <AdminIdCell value={wallet.tenantId} label="租户 ID" />
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminIdCell value={wallet.userId} label="用户 ID" />
                      </AdminTableCell>
                      <AdminTableCell>
                        <span
                          className={cn(
                            'tabular-nums',
                            isLow && 'font-medium text-amber-600 dark:text-amber-400',
                          )}
                        >
                          {wallet.availableBalance}
                          {isLow ? ' · 偏低' : ''}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>{wallet.frozenBalance}</AdminTableCell>
                      <AdminTableCell>{wallet.balance}</AdminTableCell>
                      {onNavigate ? (
                        <AdminTableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onNavigate({
                                  tab: 'ledger',
                                  tenantId: wallet.tenantId,
                                  userId: wallet.userId,
                                })
                              }
                            >
                              积分流水
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onNavigate({
                                  tab: 'orders',
                                  tenantId: wallet.tenantId,
                                  userId: wallet.userId,
                                })
                              }
                            >
                              充值订单
                            </Button>
                          </div>
                        </AdminTableCell>
                      ) : null}
                    </AdminTableRow>
                  )
                })}
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
