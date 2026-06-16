import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useId, useMemo, useState } from 'react'

import {
  adminBillingLedgerQuery,
  adminLedgerListSchema,
  type AdminLedgerList,
} from '~/features/billing/lib/billing-admin-api'
import type { BillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { useBillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import {
  formatLedgerAmount,
  formatLedgerEntryType,
  LEDGER_ENTRY_TYPE_OPTIONS,
} from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { validateOptionalUuidFilters } from '~/shared/lib/uuid'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT, adminAntZeroBasedPagination } from '~/shared/ant'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { formatAdminIsoDate } from '~/shared/ui/admin-status-badge'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

const PAGE_SIZE = 20

type LedgerRow = AdminLedgerList['items'][number]

export function BillingLedgerPanel({ filterSeed }: { filterSeed?: BillingFilterSeed }) {
  const tenantIdInputId = useId()
  const userIdInputId = useId()
  const entryTypeInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [entryType, setEntryType] = useState('all')
  const [filters, setFilters] = useState<{
    tenantId?: string
    userId?: string
    entryType?: string
  }>({})
  const [page, setPage] = useState(0)
  const [filterError, setFilterError] = useState<string | null>(null)

  const applySeed = useCallback((seed: BillingFilterSeed) => {
    if (!seed.tenantId) return
    setTenantId(seed.tenantId)
    setUserId(seed.userId ?? '')
    setPage(0)
    setFilters({
      tenantId: seed.tenantId,
      userId: seed.userId,
      entryType: undefined,
    })
    setFilterError(null)
  }, [])

  useBillingFilterSeed(filterSeed, applySeed)

  const activeTenantId = filters.tenantId

  const query = useQuery({
    queryKey: billingAdminQueryKeys.ledger(
      activeTenantId ?? '',
      { userId: filters.userId, entryType: filters.entryType },
      page,
    ),
    enabled: Boolean(activeTenantId),
    queryFn: async () =>
      adminLedgerListSchema.parse(
        await billingAdminApi.get(
          `/tenants/${activeTenantId}/ledger${adminBillingLedgerQuery({
            userId: filters.userId,
            entryType: filters.entryType,
            page,
            size: PAGE_SIZE,
          })}`,
        ),
      ),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  const columns = useMemo<TableColumnsType<LedgerRow>>(
    () => [
      {
        title: '时间',
        key: 'createdAt',
        render: (_value, entry) => formatAdminIsoDate(entry.createdAt),
      },
      {
        title: '用户 ID',
        key: 'userId',
        render: (_value, entry) => <AdminIdCell value={entry.userId} label="用户 ID" />,
      },
      {
        title: '类型',
        key: 'entryType',
        render: (_value, entry) => formatLedgerEntryType(entry.entryType),
      },
      {
        title: '变动',
        key: 'amount',
        render: (_value, entry) => (
          <span
            className={
              entry.amount >= 0
                ? 'font-medium text-primary tabular-nums'
                : 'font-medium text-destructive tabular-nums'
            }
          >
            {formatLedgerAmount(entry.amount)}
          </span>
        ),
      },
      {
        title: '余额',
        dataIndex: 'balanceAfter',
        key: 'balanceAfter',
      },
      {
        title: '产品',
        dataIndex: 'productCode',
        key: 'productCode',
      },
      {
        title: '备注',
        key: 'remark',
        className: 'max-w-[240px] truncate',
        render: (_value, entry) => <span title={entry.remark}>{entry.remark}</span>,
      },
    ],
    [],
  )

  return (
    <AdminPanel>
      <div className="space-y-4 border-b border-border/60 px-6 py-5">
        <div>
          <h3 className="text-base font-medium">积分流水</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            租户内充值、调账、扣费、退款与划拨流水；需填写租户 ID 后查询。
          </p>
        </div>
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            const nextTenantId = tenantId.trim()
            const nextUserId = userId.trim() || undefined
            const nextEntryType =
              entryType === 'all' ? undefined : entryType.trim() || undefined
            if (!nextTenantId) {
              setFilterError('租户 ID 为必填项')
              return
            }
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
              entryType: nextEntryType,
            })
          }}
        >
          <AdminField label="租户 ID" htmlFor={tenantIdInputId}>
            <Input
              id={tenantIdInputId}
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              placeholder="必填 UUID"
              required
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
          <AdminField label="流水类型" htmlFor={entryTypeInputId}>
            <Select value={entryType} onValueChange={(value) => setEntryType(value ?? 'all')}>
              <SelectTrigger id={entryTypeInputId} className="w-full mb-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEDGER_ENTRY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminField>
          <div className="flex items-end gap-2">
            <Button type="submit">查询</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTenantId('')
                setUserId('')
                setEntryType('all')
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
        {!activeTenantId ? (
          <AdminEmptyState message="请输入租户 ID 并点击查询。" />
        ) : query.isLoading ? (
          <AdminTableSkeleton columns={7} showPagination />
        ) : errorMessage ? (
          <AdminEmptyState
            message={errorMessage}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : query.data && query.data.items.length === 0 ? (
          <AdminEmptyState message="暂无流水记录。" />
        ) : query.data ? (
          <AdminAntTable<LedgerRow>
            bodyHeight={ADMIN_LIST_TABLE_BODY_HEIGHT}
            rowKey="id"
            columns={columns}
            dataSource={query.data.items}
            pagination={adminAntZeroBasedPagination(page, PAGE_SIZE, query.data.total, setPage)}
          />
        ) : null}
      </div>
    </AdminPanel>
  )
}
