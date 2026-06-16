import { Button, Input } from '@repo/ui'
import type { TableColumnsType } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useId, useMemo, useState } from 'react'

import {
  adminAdjustRecordListSchema,
  adminBillingAdjustRecordsQuery,
  type AdminAdjustRecordList,
} from '~/features/billing/lib/billing-admin-api'
import type { BillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { useBillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { useAdminTableColumnPrefs } from '~/shared/hooks/use-admin-table-column-prefs'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { validateOptionalUuidFilters } from '~/shared/lib/uuid'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT, adminAntZeroBasedPagination } from '~/shared/ant'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import { AdminEmptyState, AdminPanel } from '~/shared/ui/admin-page-shell'
import { formatAdminIsoDate } from '~/shared/ui/admin-status-badge'
import { AdminTableColumnPicker } from '~/shared/ui/admin-table-column-picker'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

const PAGE_SIZE = 20

const ADJUST_RECORD_TABLE_COLUMNS = [
  { key: 'createdAt', label: '时间' },
  { key: 'tenantId', label: '租户 ID' },
  { key: 'userId', label: '用户 ID' },
  { key: 'amount', label: '变动' },
  { key: 'balanceAfter', label: '余额' },
  { key: 'remark', label: '备注' },
] as const

type AdjustRecordRow = AdminAdjustRecordList['items'][number]

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
  const columnPrefs = useAdminTableColumnPrefs('billing-adjust-records', [
    ...ADJUST_RECORD_TABLE_COLUMNS,
  ])

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

  const columns = useMemo<TableColumnsType<AdjustRecordRow>>(() => {
    const cols: TableColumnsType<AdjustRecordRow> = [
      {
        title: '时间',
        key: 'createdAt',
        render: (_value, record) => formatAdminIsoDate(record.createdAt),
      },
      {
        title: '租户 ID',
        key: 'tenantId',
        render: (_value, record) => <AdminIdCell value={record.tenantId} label="租户 ID" />,
      },
      {
        title: '用户 ID',
        key: 'userId',
        render: (_value, record) => <AdminIdCell value={record.userId} label="用户 ID" />,
      },
      {
        title: '变动',
        key: 'amount',
        render: (_value, record) => (
          <span
            className={
              record.amount >= 0
                ? 'font-medium text-primary tabular-nums'
                : 'font-medium text-destructive tabular-nums'
            }
          >
            {formatAdjustAmount(record.amount)}
          </span>
        ),
      },
      {
        title: '余额',
        dataIndex: 'balanceAfter',
        key: 'balanceAfter',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
      },
    ]
    return cols.filter((column) => columnPrefs.isColumnVisible(String(column.key)))
  }, [columnPrefs.isColumnVisible, columnPrefs.visible])

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
            <AdminTableColumnPicker
              columns={[...ADJUST_RECORD_TABLE_COLUMNS]}
              visible={columnPrefs.visible}
              onVisibleChange={columnPrefs.setColumnVisible}
              onReset={columnPrefs.resetColumns}
            />
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
          <AdminAntTable<AdjustRecordRow>
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
