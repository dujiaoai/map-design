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
import { FileTextIcon } from 'lucide-react'
import { useCallback, useId, useMemo, useState } from 'react'

import {
  adminBillingInvoicesQuery,
  adminInvoiceListSchema,
  type AdminInvoice,
  INVOICE_STATUSES,
} from '~/features/billing/lib/billing-admin-api'
import { BillingInvoiceIssueSheet } from '~/features/billing/ui/billing-invoice-issue-sheet'
import { BillingInvoiceRejectSheet } from '~/features/billing/ui/billing-invoice-reject-sheet'
import type { BillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { useBillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { validateOptionalUuidFilters } from '~/shared/lib/uuid'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT, adminAntZeroBasedPagination } from '~/shared/ant'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'
import { AdminEmptyState, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { AdminStatusBadge, formatAdminIsoDate } from '~/shared/ui/admin-status-badge'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

const PAGE_SIZE = 20

function invoiceStatusLabel(status: string) {
  if (status === 'pending') return '待处理'
  if (status === 'issued') return '已开具'
  if (status === 'rejected') return '已驳回'
  return status
}

function invoiceTypeLabel(type: string) {
  if (type === 'personal') return '个人'
  if (type === 'enterprise') return '企业'
  return type
}

export function BillingInvoicesPanel({
  filterSeed,
}: {
  filterSeed?: BillingFilterSeed
}) {
  const { can } = useAdminPermissions()
  const canAdjust = can('admin:billing:adjust')

  const tenantIdInputId = useId()
  const userIdInputId = useId()

  const [tenantId, setTenantId] = useState('')
  const [userId, setUserId] = useState('')
  const [status, setStatus] = useState('pending')
  const [filters, setFilters] = useState<{
    tenantId?: string
    userId?: string
    status?: string
  }>({ status: 'pending' })
  const [page, setPage] = useState(0)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [issuingInvoice, setIssuingInvoice] = useState<AdminInvoice | null>(null)
  const [rejectingInvoice, setRejectingInvoice] = useState<AdminInvoice | null>(null)

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
    queryKey: billingAdminQueryKeys.invoices(filters, page),
    queryFn: async () =>
      adminInvoiceListSchema.parse(
        await billingAdminApi.get(
          `/invoices${adminBillingInvoicesQuery({
            tenantId: filters.tenantId,
            userId: filters.userId,
            status: filters.status,
            page,
            size: PAGE_SIZE,
          })}`,
        ),
      ),
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  function applyFilters() {
    const validation = validateOptionalUuidFilters({
      '租户 ID': tenantId,
      '用户 ID': userId,
    })
    if (validation) {
      setFilterError(validation)
      return
    }
    setFilterError(null)
    setPage(0)
    setFilters({
      tenantId: tenantId.trim() || undefined,
      userId: userId.trim() || undefined,
      status: status === 'all' ? undefined : status,
    })
  }

  const columns = useMemo<TableColumnsType<AdminInvoice>>(() => {
    const cols: TableColumnsType<AdminInvoice> = [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        key: 'orderNo',
        render: (orderNo: string) => <span className="font-mono text-xs">{orderNo}</span>,
      },
      {
        title: '租户 / 用户',
        key: 'tenantUser',
        render: (_value, invoice) => (
          <div className="space-y-1">
            <AdminIdCell value={invoice.tenantId} label="租户" />
            <AdminIdCell value={invoice.userId} label="用户" />
          </div>
        ),
      },
      {
        title: '类型 / 抬头',
        key: 'invoiceType',
        render: (_value, invoice) => (
          <div className="space-y-0.5">
            <p>{invoiceTypeLabel(invoice.invoiceType)}</p>
            <p className="text-xs text-muted-foreground">{invoice.title}</p>
            {invoice.taxNo ? (
              <p className="font-mono text-xs text-muted-foreground">{invoice.taxNo}</p>
            ) : null}
          </div>
        ),
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '金额',
        key: 'amount',
        render: (_value, invoice) =>
          formatBillingPrice(invoice.amountCents, invoice.currency),
      },
      {
        title: '状态',
        key: 'status',
        render: (_value, invoice) => (
          <>
            <AdminStatusBadge
              status={invoice.status}
              label={invoiceStatusLabel(invoice.status)}
            />
            {invoice.adminRemark ? (
              <p className="mt-1 max-w-[180px] truncate text-xs text-muted-foreground">
                {invoice.adminRemark}
              </p>
            ) : null}
            {invoice.status === 'issued' && invoice.pdfUrl ? (
              <p className="mt-1 max-w-[180px] truncate font-mono text-xs text-muted-foreground">
                {invoice.pdfUrl}
              </p>
            ) : null}
          </>
        ),
      },
      {
        title: '申请时间',
        key: 'createdAt',
        render: (_value, invoice) => formatAdminIsoDate(invoice.createdAt),
      },
    ]
    if (canAdjust) {
      cols.push({
        title: '操作',
        key: 'actions',
        render: (_value, invoice) =>
          invoice.status === 'pending' ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIssuingInvoice(invoice)}
              >
                标记已开
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setRejectingInvoice(invoice)}
              >
                驳回
              </Button>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      })
    }
    return cols
  }, [canAdjust])

  return (
    <div className="space-y-4">
      <AdminPanel>
        <AdminPanelHeader
          icon={FileTextIcon}
          title="发票申请"
          description="用户为已支付充值订单提交的开票申请；平台可标记已开具或驳回（骨架，不含电子发票对接）。"
        />
        <div className="flex flex-wrap items-end gap-3 px-4 py-5 md:px-5">
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
            <Select
              value={status}
              onValueChange={(value) => {
                if (value == null) return
                setStatus(value)
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AdminField>
          <Button type="button" size="sm" onClick={applyFilters}>
            筛选
          </Button>
        </div>
        {filterError ? (
          <div className="px-4 pb-5 md:px-5">
            <AdminFormError message={filterError} />
          </div>
        ) : null}
      </AdminPanel>

      <AdminPanel className="p-0">
        {query.isLoading ? (
          <div className="px-6 py-5">
            <AdminTableSkeleton columns={8} rows={5} />
          </div>
        ) : errorMessage ? (
          <div className="px-6 py-5">
            <AdminEmptyState
              message={errorMessage}
              onRetry={() => void query.refetch()}
              isRetrying={query.isFetching}
            />
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="px-6 py-5">
            <AdminEmptyState message="暂无发票申请" />
          </div>
        ) : query.data ? (
          <AdminAntTable<AdminInvoice>
            bodyHeight={ADMIN_LIST_TABLE_BODY_HEIGHT}
            rowKey="id"
            columns={columns}
            dataSource={query.data.items}
            pagination={adminAntZeroBasedPagination(page, PAGE_SIZE, query.data.total, setPage)}
          />
        ) : null}
      </AdminPanel>

      {canAdjust ? (
        <>
          <BillingInvoiceIssueSheet
            invoice={issuingInvoice}
            open={issuingInvoice !== null}
            onOpenChange={(open) => {
              if (!open) setIssuingInvoice(null)
            }}
          />
          <BillingInvoiceRejectSheet
            invoice={rejectingInvoice}
            open={rejectingInvoice !== null}
            onOpenChange={(open) => {
              if (!open) setRejectingInvoice(null)
            }}
          />
        </>
      ) : null}
    </div>
  )
}
