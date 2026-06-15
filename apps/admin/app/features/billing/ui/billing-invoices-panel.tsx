import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileTextIcon } from 'lucide-react'
import { useCallback, useId, useState } from 'react'

import {
  adminBillingInvoicesQuery,
  adminInvoiceListSchema,
  type AdminInvoice,
  INVOICE_STATUSES,
} from '~/features/billing/lib/billing-admin-api'
import type { BillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { useBillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { validateOptionalUuidFilters } from '~/shared/lib/uuid'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
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
import { AdminStatusBadge, formatAdminIsoDate } from '~/shared/ui/admin-status-badge'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'

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
  const queryClient = useQueryClient()

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
  const [actionError, setActionError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

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

  const issueMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      setActingId(invoiceId)
      setActionError(null)
      await billingAdminApi.post(`/invoices/${encodeURIComponent(invoiceId)}/issue`)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.all })
    },
    onError: (error) => {
      setActionError(formatAdminApiError(error))
    },
    onSettled: () => {
      setActingId(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (invoice: AdminInvoice) => {
      setActingId(invoice.id)
      setActionError(null)
      const reason = window.prompt('请输入驳回原因', '抬头信息有误')
      if (!reason?.trim()) {
        throw new Error('已取消驳回')
      }
      await billingAdminApi.post(`/invoices/${encodeURIComponent(invoice.id)}/reject`, {
        reason: reason.trim(),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.all })
    },
    onError: (error) => {
      const message = formatAdminApiError(error)
      if (message !== '已取消驳回') {
        setActionError(message)
      }
    },
    onSettled: () => {
      setActingId(null)
    },
  })

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  function applyFilters() {
    const validation = validateOptionalUuidFilters({ tenantId, userId })
    if (!validation.ok) {
      setFilterError(validation.message)
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

  return (
    <div className="space-y-4">
      <AdminPanel>
        <div className="border-b border-border/60 px-6 py-5">
          <div className="flex items-start gap-3">
            <FileTextIcon className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <h3 className="text-base font-medium">发票申请</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                用户为已支付充值订单提交的开票申请；平台可标记已开具或驳回（骨架，不含电子发票对接）。
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 px-6 py-5">
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
            <Select value={status} onValueChange={setStatus}>
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
          <div className="px-6 pb-5">
            <AdminFormError message={filterError} />
          </div>
        ) : null}
        {actionError ? (
          <div className="px-6 pb-5">
            <AdminFormError message={actionError} />
          </div>
        ) : null}
      </AdminPanel>

      <AdminPanel>
        {query.isLoading ? (
          <div className="px-6 py-5">
            <AdminTableSkeleton columns={8} rows={5} />
          </div>
        ) : errorMessage ? (
          <div className="px-6 py-5">
            <AdminEmptyState message={errorMessage} />
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="px-6 py-5">
            <AdminEmptyState message="暂无发票申请" />
          </div>
        ) : query.data ? (
          <>
            <AdminDataTable>
              <AdminTableHead>
                <AdminTableRow>
                  <AdminTableHeaderCell>订单号</AdminTableHeaderCell>
                  <AdminTableHeaderCell>租户 / 用户</AdminTableHeaderCell>
                  <AdminTableHeaderCell>类型 / 抬头</AdminTableHeaderCell>
                  <AdminTableHeaderCell>邮箱</AdminTableHeaderCell>
                  <AdminTableHeaderCell>金额</AdminTableHeaderCell>
                  <AdminTableHeaderCell>状态</AdminTableHeaderCell>
                  <AdminTableHeaderCell>申请时间</AdminTableHeaderCell>
                  {canAdjust ? <AdminTableHeaderCell>操作</AdminTableHeaderCell> : null}
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {query.data.items.map((invoice) => (
                  <AdminTableRow key={invoice.id}>
                    <AdminTableCell className="font-mono text-xs">{invoice.orderNo}</AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1">
                        <AdminIdCell value={invoice.tenantId} label="租户" />
                        <AdminIdCell value={invoice.userId} label="用户" />
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-0.5">
                        <p>{invoiceTypeLabel(invoice.invoiceType)}</p>
                        <p className="text-xs text-muted-foreground">{invoice.title}</p>
                        {invoice.taxNo ? (
                          <p className="font-mono text-xs text-muted-foreground">{invoice.taxNo}</p>
                        ) : null}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>{invoice.email}</AdminTableCell>
                    <AdminTableCell>
                      {formatBillingPrice(invoice.amountCents, invoice.currency)}
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusBadge
                        status={invoice.status}
                        label={invoiceStatusLabel(invoice.status)}
                      />
                      {invoice.adminRemark ? (
                        <p className="mt-1 max-w-[180px] truncate text-xs text-muted-foreground">
                          {invoice.adminRemark}
                        </p>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell>{formatAdminIsoDate(invoice.createdAt)}</AdminTableCell>
                    {canAdjust ? (
                      <AdminTableCell>
                        {invoice.status === 'pending' ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={actingId === invoice.id}
                              onClick={() => void issueMutation.mutateAsync(invoice.id)}
                            >
                              标记已开
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={actingId === invoice.id}
                              onClick={() => void rejectMutation.mutateAsync(invoice)}
                            >
                              驳回
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </AdminTableCell>
                    ) : null}
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminDataTable>
            <AdminTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              total={query.data.total}
              onPageChange={setPage}
            />
          </>
        ) : null}
      </AdminPanel>
    </div>
  )
}
