import { Button, Input } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useId, useState } from 'react'

import {
  adminAdjustRecordListSchema,
  adminBillingAdjustRecordsQuery,
} from '~/features/billing/lib/billing-admin-api'
import type { BillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { useBillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
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
import { formatAdminIsoDate } from '~/shared/ui/admin-status-badge'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'

const PAGE_SIZE = 20

function formatAdjustAmount(amount: number) {
  if (amount > 0) return `+${amount}`
  return String(amount)
}

export function BillingAdjustRecordsPanel({
  filterSeed,
}: {
  filterSeed?: BillingFilterSeed
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
    queryKey: billingAdminQueryKeys.adjustRecords(filters, page),
    queryFn: async () =>
      adminAdjustRecordListSchema.parse(
        await billingAdminApi.get(
          `/adjust-records${adminBillingAdjustRecordsQuery({ ...filters, page, size: PAGE_SIZE })}`,
        ),
      ),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <AdminPanel>
      <div className="space-y-4 border-b border-border/60 px-6 py-5">
        <div>
          <h3 className="text-base font-medium">调账记录</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            平台人工调账流水；不含注册赠送等系统自动调账。
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
              onClick={() => {
                setTenantId('')
                setUserId('')
                setPage(0)
                setFilters({})
                setFilterError(null)
              }}
            >
              重置
            </Button>
          </div>
        </form>
        {filterError ? <AdminFormError message={filterError} /> : null}
      </div>
      <div className="px-2 py-2">
        {query.isLoading ? (
          <AdminTableSkeleton columns={6} showPagination />
        ) : errorMessage ? (
          <AdminEmptyState
            message={errorMessage}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : query.data && query.data.items.length === 0 ? (
          <AdminEmptyState message="暂无调账记录。" />
        ) : query.data ? (
          <>
            <AdminDataTable>
              <AdminTableHead>
                <AdminTableRow>
                  <AdminTableHeaderCell>时间</AdminTableHeaderCell>
                  <AdminTableHeaderCell>租户 ID</AdminTableHeaderCell>
                  <AdminTableHeaderCell>用户 ID</AdminTableHeaderCell>
                  <AdminTableHeaderCell>变动</AdminTableHeaderCell>
                  <AdminTableHeaderCell>余额</AdminTableHeaderCell>
                  <AdminTableHeaderCell>备注</AdminTableHeaderCell>
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {query.data.items.map((record) => (
                  <AdminTableRow key={record.id}>
                    <AdminTableCell>{formatAdminIsoDate(record.createdAt)}</AdminTableCell>
                    <AdminTableCell>
                      <AdminIdCell value={record.tenantId} label="租户 ID" />
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminIdCell value={record.userId} label="用户 ID" />
                    </AdminTableCell>
                    <AdminTableCell>
                      <span
                        className={
                          record.amount >= 0
                            ? 'font-medium text-primary tabular-nums'
                            : 'font-medium text-destructive tabular-nums'
                        }
                      >
                        {formatAdjustAmount(record.amount)}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>{record.balanceAfter}</AdminTableCell>
                    <AdminTableCell>{record.remark}</AdminTableCell>
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
