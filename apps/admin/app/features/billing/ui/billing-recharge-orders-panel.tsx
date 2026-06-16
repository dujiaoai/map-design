import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useId, useMemo, useState } from 'react'

import {
  adminBillingRechargeOrdersQuery,
  adminRechargeOrderListSchema,
  type AdminRechargeOrder,
  RECHARGE_ORDER_STATUSES,
} from '~/features/billing/lib/billing-admin-api'
import type { BillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { useBillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { BillingRechargeRefundSheet } from '~/features/billing/ui/billing-recharge-refund-sheet'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { validateOptionalUuidFilters } from '~/shared/lib/uuid'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT, adminAntZeroBasedPagination } from '~/shared/ant'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminStatusBadge, formatAdminIsoDate } from '~/shared/ui/admin-status-badge'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

const PAGE_SIZE = 20

export function BillingRechargeOrdersPanel({
  canRefund = false,
  filterSeed,
}: {
  canRefund?: boolean
  filterSeed?: BillingFilterSeed
}) {
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
  const [refundingOrder, setRefundingOrder] = useState<AdminRechargeOrder | null>(null)
  const [filterError, setFilterError] = useState<string | null>(null)

  const applySeed = useCallback((seed: BillingFilterSeed) => {
    setTenantId(seed.tenantId ?? '')
    setUserId(seed.userId ?? '')
    setPage(0)
    setFilters({
      tenantId: seed.tenantId,
      userId: seed.userId,
      status: status === 'all' ? undefined : status,
    })
    setFilterError(null)
  }, [status])

  useBillingFilterSeed(filterSeed, applySeed)

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
  const columnCount = 8 + (canRefund ? 1 : 0)

  function resetOrderFilters() {
    setTenantId('')
    setUserId('')
    setStatus('all')
    setPage(0)
    setFilters({})
    setFilterError(null)
  }

  const hasOrderFilters = Boolean(
    filters.tenantId || filters.userId || filters.status,
  )

  const columns = useMemo<TableColumnsType<AdminRechargeOrder>>(() => {
    const cols: TableColumnsType<AdminRechargeOrder> = [
      {
        title: '订单号',
        key: 'orderNo',
        render: (_value, order) => <AdminIdCell value={order.orderNo} label="订单号" />,
      },
      {
        title: '状态',
        key: 'status',
        render: (_value, order) => <AdminStatusBadge status={order.status} />,
      },
      {
        title: '租户',
        key: 'tenantId',
        render: (_value, order) => <AdminIdCell value={order.tenantId} label="租户 ID" />,
      },
      {
        title: '用户',
        key: 'userId',
        render: (_value, order) => <AdminIdCell value={order.userId} label="用户 ID" />,
      },
      {
        title: '积分',
        key: 'points',
        render: (_value, order) => order.points.toLocaleString('zh-CN'),
      },
      {
        title: '金额',
        key: 'price',
        render: (_value, order) =>
          order.couponDiscountCents > 0 ? (
            <div className="space-y-0.5">
              <p>{formatBillingPrice(order.priceCents, order.currency)}</p>
              <p className="text-xs text-muted-foreground">
                原价 {formatBillingPrice(order.listPriceCents, order.currency)}，抵扣{' '}
                {formatBillingPrice(order.couponDiscountCents, order.currency)}
              </p>
              {order.couponCode ? (
                <p className="font-mono text-xs text-muted-foreground">{order.couponCode}</p>
              ) : null}
            </div>
          ) : (
            formatBillingPrice(order.priceCents, order.currency)
          ),
      },
      {
        title: '渠道',
        dataIndex: 'channel',
        key: 'channel',
      },
      {
        title: '支付时间',
        key: 'paidAt',
        render: (_value, order) => formatAdminIsoDate(order.paidAt),
      },
    ]
    if (canRefund) {
      cols.push({
        title: '操作',
        key: 'actions',
        render: (_value, order) =>
          order.status === 'paid' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRefundingOrder(order)}
            >
              退款
            </Button>
          ) : (
            '—'
          ),
      })
    }
    return cols
  }, [canRefund])

  return (
    <>
      <AdminPanel>
        <div className="space-y-4 border-b border-border/60 px-6 py-5">
          <div>
            <h3 className="text-base font-medium">充值订单</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              全平台充值订单；已支付订单可发起退款（扣回积分），操作记入审计日志。
            </p>
          </div>
          <form
            className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px_auto]"
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
              setFilters({
                tenantId: nextTenantId,
                userId: nextUserId,
                status: status === 'all' ? undefined : status.trim() || undefined,
              })
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
            <AdminField label="状态">
              <Select value={status} onValueChange={(value) => setStatus(value ?? '')}>
                <SelectTrigger className="w-full mb-0">
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
            <div className="flex h-9 items-center gap-2">
              <Button type="submit" size="sm">
                筛选
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetOrderFilters}
              >
                重置
              </Button>
            </div>
          </form>
          {filterError ? <AdminFormError message={filterError} /> : null}
        </div>
        <div className="px-2 py-2">
          {query.isLoading ? (
            <AdminTableSkeleton columns={columnCount} showPagination />
          ) : errorMessage ? (
            <AdminEmptyState
              message={errorMessage}
              onRetry={() => void query.refetch()}
              isRetrying={query.isFetching}
            />
          ) : query.data && query.data.items.length === 0 ? (
            hasOrderFilters ? (
              <AdminEmptyState
                message="未找到匹配订单。"
                action={
                  <Button type="button" variant="outline" size="sm" onClick={resetOrderFilters}>
                    清除筛选
                  </Button>
                }
              />
            ) : (
              <AdminEmptyState message="暂无充值订单。" />
            )
          ) : query.data ? (
            <AdminAntTable<AdminRechargeOrder>
              bodyHeight={ADMIN_LIST_TABLE_BODY_HEIGHT}
              rowKey="orderNo"
              columns={columns}
              dataSource={query.data.items}
              pagination={adminAntZeroBasedPagination(page, PAGE_SIZE, query.data.total, setPage)}
            />
          ) : null}
        </div>
      </AdminPanel>
      {canRefund ? (
        <BillingRechargeRefundSheet
          order={refundingOrder}
          open={refundingOrder !== null}
          onOpenChange={(open) => {
            if (!open) setRefundingOrder(null)
          }}
        />
      ) : null}
    </>
  )
}
