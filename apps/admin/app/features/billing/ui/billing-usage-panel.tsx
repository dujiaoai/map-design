import { Button, Input } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useId, useState } from 'react'

import {
  adminBillingUsageQuery,
  adminUsageSummarySchema,
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
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

export function BillingUsagePanel({ filterSeed }: { filterSeed?: BillingFilterSeed }) {
  const tenantIdInputId = useId()
  const productCodeInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [productCode, setProductCode] = useState('')
  const [filters, setFilters] = useState<{ tenantId?: string; productCode?: string }>({})
  const [filterError, setFilterError] = useState<string | null>(null)

  const applySeed = useCallback((seed: BillingFilterSeed) => {
    if (!seed.tenantId) return
    setTenantId(seed.tenantId)
    setFilters((prev) => ({ ...prev, tenantId: seed.tenantId }))
    setFilterError(null)
  }, [])

  useBillingFilterSeed(filterSeed, applySeed)

  const query = useQuery({
    queryKey: billingAdminQueryKeys.usage(filters),
    queryFn: async () =>
      adminUsageSummarySchema.parse(
        await billingAdminApi.get(`/usage${adminBillingUsageQuery(filters)}`),
      ),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <AdminPanel>
      <div className="space-y-4 border-b border-border/60 px-6 py-5">
        <div>
          <h3 className="text-base font-medium">平台消费用量</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            近 30 天已确认扣费汇总；默认全平台，可按租户 UUID 或产品代码筛选。
          </p>
        </div>
        <form
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            const nextTenantId = tenantId.trim() || undefined
            const uuidError = validateOptionalUuidFilters({ '租户 ID': nextTenantId })
            if (uuidError) {
              setFilterError(uuidError)
              return
            }
            setFilterError(null)
            setFilters({
              tenantId: nextTenantId,
              productCode: productCode.trim() || undefined,
            })
          }}
        >
          <AdminField label="租户 ID（可选）" htmlFor={tenantIdInputId}>
            <Input
              id={tenantIdInputId}
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              placeholder="留空表示全平台"
            />
          </AdminField>
          <AdminField label="产品代码（可选）" htmlFor={productCodeInputId}>
            <Input
              id={productCodeInputId}
              value={productCode}
              onChange={(event) => setProductCode(event.target.value)}
              placeholder="map-workspace"
            />
          </AdminField>
          <div className="flex items-end gap-2">
            <Button type="submit">筛选</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTenantId('')
                setProductCode('')
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
          <AdminTableSkeleton columns={4} />
        ) : errorMessage ? (
          <AdminEmptyState message={errorMessage} />
        ) : query.data ? (
          <div className="space-y-4 px-4 py-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryChip label="统计区间" value={`${query.data.from.slice(0, 10)} ~ ${query.data.to.slice(0, 10)}`} />
              <SummaryChip label="总消耗" value={`${query.data.totalPoints.toLocaleString('zh-CN')} 点`} />
              <SummaryChip
                label="明细条数"
                value={`${query.data.items.length} 条`}
              />
            </div>
            {query.data.productCode ? (
              <p className="text-sm text-muted-foreground">产品：{query.data.productCode}</p>
            ) : null}
            {query.data.items.length === 0 ? (
              <AdminEmptyState message="该条件下暂无消费记录。" />
            ) : (
              <AdminDataTable>
                <AdminTableHead>
                  <AdminTableRow>
                    <AdminTableHeaderCell>租户 ID</AdminTableHeaderCell>
                    <AdminTableHeaderCell>用户 ID</AdminTableHeaderCell>
                    <AdminTableHeaderCell>消耗点数</AdminTableHeaderCell>
                    <AdminTableHeaderCell>事件数</AdminTableHeaderCell>
                  </AdminTableRow>
                </AdminTableHead>
                <AdminTableBody>
                  {query.data.items.map((item) => (
                    <AdminTableRow key={`${item.tenantId}:${item.userId}`}>
                      <AdminTableCell>
                        <AdminIdCell value={item.tenantId} label="租户 ID" />
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminIdCell value={item.userId} label="用户 ID" />
                      </AdminTableCell>
                      <AdminTableCell>{item.totalPoints.toLocaleString('zh-CN')}</AdminTableCell>
                      <AdminTableCell>{item.eventCount.toLocaleString('zh-CN')}</AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminDataTable>
            )}
          </div>
        ) : null}
      </div>
    </AdminPanel>
  )
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/15 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium tabular-nums">{value}</p>
    </div>
  )
}
