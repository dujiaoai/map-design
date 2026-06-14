import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'

import {
  adminBillingRechargeOrdersQuery,
  adminRechargeOrderListSchema,
  RECHARGE_ORDER_STATUSES,
} from '~/features/billing/lib/billing-admin-api'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { BillingRechargeRefundSheet } from '~/features/billing/ui/billing-recharge-refund-sheet'
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
import { AdminStatusBadge, formatAdminIsoDate } from '~/shared/ui/admin-status-badge'
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'

const PAGE_SIZE = 20

export function BillingRechargeOrdersPanel({ canRefund = false }: { canRefund?: boolean }) {
  const tenantIdInputId = useId()
  const userIdInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState('all')
  const [filters, setFilters] = useState<{
    tenantId?: string
    userId?: string
    status?: string
  }>({})
  const [page, setPage] = useState(0)
  const [refundingOrderNo, setRefundingOrderNo] = useState<string | null>(null)

  const query = useQuery({
    queryKey: billingAdminQueryKeys.rechargeOrders(filters, page),
    queryFn: async () =>
      adminRechargeOrderListSchema.parse(
        await billingAdminApi.get(
          `/recharge-orders${adminBillingRechargeOrdersQuery({ ...filters, page, size: PAGE_SIZE })}`,
        ),
      ),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <>
      <AdminPanel>
        <div className="space-y-4 border-b border-border/60 px-6 py-5">
          <div>
            <h3 className="text-base font-medium">充值订单</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              全平台充值订单；已支付订单可发起退款（扣回积分）。
            </p>
          </div>
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_140px_auto_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              setPage(0)
              setFilters({
                tenantId: tenantId.trim() || undefined,
                userId: userId.trim() || undefined,
                status: status === 'all' ? undefined : status.trim() || undefined,
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
            <AdminField label="状态">
              <Select value={status} onValueChange={(value) => setStatus(value ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  {RECHARGE_ORDER_STATUSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminField>
            <div className="flex items-end gap-2">
              <Button type="submit">筛选</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTenantId('')
                  setUserId('')
                  setStatus('all')
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
                    <AdminTableHeaderCell>支付时间</AdminTableHeaderCell>
                    {canRefund ? <AdminTableHeaderCell>操作</AdminTableHeaderCell> : null}
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
                      <AdminTableCell>{formatAdminIsoDate(order.paidAt)}</AdminTableCell>
                      {canRefund ? (
                        <AdminTableCell>
                          {order.status === 'paid' ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setRefundingOrderNo(order.orderNo)}
                            >
                              退款
                            </Button>
                          ) : (
                            '—'
                          )}
                        </AdminTableCell>
                      ) : null}
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
      {canRefund ? (
        <BillingRechargeRefundSheet
          orderNo={refundingOrderNo}
          open={refundingOrderNo !== null}
          onOpenChange={(open) => {
            if (!open) setRefundingOrderNo(null)
          }}
        />
      ) : null}
    </>
  )
}
