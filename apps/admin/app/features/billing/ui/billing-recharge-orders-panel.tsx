import { Button, Input } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'

import {
  adminBillingRechargeOrdersQuery,
  adminRechargeOrderListSchema,
} from '~/features/billing/lib/billing-admin-api'
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
import { AdminStatusBadge } from '~/shared/ui/admin-status-badge'

const PAGE_SIZE = 20

export function BillingRechargeOrdersPanel() {
  const tenantIdInputId = useId()
  const userIdInputId = useId()
  const statusInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState('')
  const [filters, setFilters] = useState<{
    tenantId?: string
    userId?: string
    status?: string
  }>({})
  const [page, setPage] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const query = useQuery({
    queryKey: ['admin', 'billing', 'recharge-orders', filters, page],
    queryFn: async () =>
      adminRechargeOrderListSchema.parse(
        await billingAdminApi.get(
          `/recharge-orders${adminBillingRechargeOrdersQuery({ ...filters, page, size: PAGE_SIZE })}`,
        ),
      ),
    enabled: submitted,
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <AdminPanel>
      <div className="space-y-4 border-b border-border/60 px-6 py-5">
        <div>
          <h3 className="text-base font-medium">充值订单</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            全平台充值订单查询；可按租户、用户、状态筛选。
          </p>
        </div>
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_120px_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(0)
            setSubmitted(true)
            setFilters({
              tenantId: tenantId.trim() || undefined,
              userId: userId.trim() || undefined,
              status: status.trim() || undefined,
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
          <AdminField label="状态" htmlFor={statusInputId}>
            <Input
              id={statusInputId}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              placeholder="paid"
            />
          </AdminField>
          <div className="flex items-end">
            <Button type="submit">查询</Button>
          </div>
        </form>
      </div>
      <div className="px-2 py-2">
        {!submitted ? (
          <AdminEmptyState message="点击查询加载充值订单。" />
        ) : query.isLoading ? (
          <AdminEmptyState message="加载中…" />
        ) : errorMessage ? (
          <AdminEmptyState message={errorMessage} />
        ) : query.data && query.data.items.length === 0 ? (
          <AdminEmptyState message="未找到匹配订单。" />
        ) : query.data ? (
          <>
            <AdminDataTable>
              <AdminTableHead>
                <AdminTableRow>
                  <AdminTableHeaderCell>订单号</AdminTableHeaderCell>
                  <AdminTableHeaderCell>状态</AdminTableHeaderCell>
                  <AdminTableHeaderCell>渠道</AdminTableHeaderCell>
                  <AdminTableHeaderCell>积分</AdminTableHeaderCell>
                  <AdminTableHeaderCell>金额(分)</AdminTableHeaderCell>
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {query.data.items.map((order) => (
                  <AdminTableRow key={order.orderNo}>
                    <AdminTableCell mono>{order.orderNo}</AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusBadge status={order.status} />
                    </AdminTableCell>
                    <AdminTableCell>{order.channel}</AdminTableCell>
                    <AdminTableCell>{order.points}</AdminTableCell>
                    <AdminTableCell>{order.priceCents}</AdminTableCell>
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
