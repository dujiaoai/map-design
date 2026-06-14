import { Button, Input } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'

import {
  adminBillingUsageQuery,
  adminUsageSummarySchema,
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

export function BillingUsagePanel() {
  const tenantIdInputId = useId()
  const productCodeInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [productCode, setProductCode] = useState('')
  const [filters, setFilters] = useState<{ tenantId?: string; productCode?: string }>({})
  const [submitted, setSubmitted] = useState(false)

  const query = useQuery({
    queryKey: ['admin', 'billing', 'usage', filters],
    queryFn: async () =>
      adminUsageSummarySchema.parse(
        await billingAdminApi.get(`/usage${adminBillingUsageQuery(filters)}`),
      ),
    enabled: submitted,
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <AdminPanel>
      <div className="space-y-4 border-b border-border/60 px-6 py-5">
        <div>
          <h3 className="text-base font-medium">平台消费用量</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            近 30 天已确认扣费汇总；可按租户或产品筛选。
          </p>
        </div>
        <form
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
            setFilters({
              tenantId: tenantId.trim() || undefined,
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
          <div className="flex items-end">
            <Button type="submit">查询</Button>
          </div>
        </form>
      </div>
      <div className="px-2 py-2">
        {!submitted ? (
          <AdminEmptyState message="设置筛选条件后点击查询。" />
        ) : query.isLoading ? (
          <AdminEmptyState message="加载用量…" />
        ) : errorMessage ? (
          <AdminEmptyState message={errorMessage} />
        ) : query.data ? (
          <div className="space-y-4 px-4 py-3">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                区间：{query.data.from.slice(0, 10)} ~ {query.data.to.slice(0, 10)}
              </span>
              <span>总消耗：{query.data.totalPoints} 点</span>
              {query.data.productCode ? <span>产品：{query.data.productCode}</span> : null}
            </div>
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
                      <AdminTableCell mono>{item.tenantId}</AdminTableCell>
                      <AdminTableCell mono>{item.userId}</AdminTableCell>
                      <AdminTableCell>{item.totalPoints}</AdminTableCell>
                      <AdminTableCell>{item.eventCount}</AdminTableCell>
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
