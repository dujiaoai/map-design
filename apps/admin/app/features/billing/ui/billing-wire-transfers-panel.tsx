import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useConfirmDialog,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2Icon } from 'lucide-react'
import { useCallback, useId, useState } from 'react'

import {
  adminBillingWireTransfersQuery,
  adminWireTransferListSchema,
  type AdminWireTransfer,
  WIRE_TRANSFER_STATUSES,
} from '~/features/billing/lib/billing-admin-api'
import type { BillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { useBillingFilterSeed } from '~/features/billing/lib/billing-filter-seed'
import { BillingWireTransferRejectSheet } from '~/features/billing/ui/billing-wire-transfer-reject-sheet'
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
import { AdminEmptyState, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { AdminStatusBadge, formatAdminIsoDate } from '~/shared/ui/admin-status-badge'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'

const PAGE_SIZE = 20

function wireTransferStatusLabel(status: string) {
  if (status === 'pending') return '待审核'
  if (status === 'credited') return '已入账'
  if (status === 'rejected') return '已驳回'
  return status
}

export function BillingWireTransfersPanel({
  filterSeed,
}: {
  filterSeed?: BillingFilterSeed
}) {
  const { can } = useAdminPermissions()
  const canAdjust = can('admin:billing:adjust')
  const queryClient = useQueryClient()
  const { confirm, confirmDialog } = useConfirmDialog()

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
  const [rejectingTransfer, setRejectingTransfer] = useState<AdminWireTransfer | null>(null)

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
    queryKey: billingAdminQueryKeys.wireTransfers(filters, page),
    queryFn: async () =>
      adminWireTransferListSchema.parse(
        await billingAdminApi.get(
          `/wire-transfers${adminBillingWireTransfersQuery({
            tenantId: filters.tenantId,
            userId: filters.userId,
            status: filters.status,
            page,
            size: PAGE_SIZE,
          })}`,
        ),
      ),
  })

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      setActingId(requestId)
      setActionError(null)
      await billingAdminApi.post(`/wire-transfers/${encodeURIComponent(requestId)}/approve`)
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

  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  async function handleApprove(item: AdminWireTransfer) {
    const confirmed = await confirm({
      title: '确认审核入账',
      description: `${item.companyName}\n${formatBillingPrice(item.amountCents, 'CNY')} · ${item.points.toLocaleString('zh-CN')} 点\n入账至申请人个人账户。`,
      confirmLabel: '确认入账',
    })
    if (!confirmed) return
    await approveMutation.mutateAsync(item.id)
  }

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

  return (
    <>
      <div className="space-y-4">
      <AdminPanel>
        <AdminPanelHeader
          icon={Building2Icon}
          title="对公转账"
          description="审核企业预付申请；通过后积分入账至申请人个人账户（骨架，不含收款账户配置）。"
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
                {WIRE_TRANSFER_STATUSES.map((item) => (
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
        {actionError ? (
          <div className="px-4 pb-5 md:px-5">
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
            <AdminEmptyState
              message={errorMessage}
              onRetry={() => void query.refetch()}
              isRetrying={query.isFetching}
            />
          </div>
        ) : query.data && query.data.items.length === 0 ? (
          <div className="px-6 py-5">
            <AdminEmptyState message="暂无对公转账申请" />
          </div>
        ) : query.data ? (
          <>
            <AdminDataTable>
              <AdminTableHead>
                <AdminTableRow>
                  <AdminTableHeaderCell>申请单号</AdminTableHeaderCell>
                  <AdminTableHeaderCell>租户 / 用户</AdminTableHeaderCell>
                  <AdminTableHeaderCell>企业 / 联系邮箱</AdminTableHeaderCell>
                  <AdminTableHeaderCell>汇款 / 积分</AdminTableHeaderCell>
                  <AdminTableHeaderCell>状态</AdminTableHeaderCell>
                  <AdminTableHeaderCell>申请时间</AdminTableHeaderCell>
                  {canAdjust ? <AdminTableHeaderCell>操作</AdminTableHeaderCell> : null}
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {query.data.items.map((item) => (
                  <AdminTableRow key={item.id}>
                    <AdminTableCell className="font-mono text-xs">{item.requestNo}</AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1">
                        <AdminIdCell value={item.tenantId} label="租户" />
                        <AdminIdCell value={item.userId} label="用户" />
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <p>{item.companyName}</p>
                      <p className="text-muted-foreground text-xs">{item.contactEmail}</p>
                      {item.bankReference ? (
                        <p className="font-mono text-xs text-muted-foreground">{item.bankReference}</p>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell>
                      <p>{formatBillingPrice(item.amountCents, 'CNY')}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.points.toLocaleString('zh-CN')} 点
                      </p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusBadge
                        status={item.status}
                        label={wireTransferStatusLabel(item.status)}
                      />
                      {item.adminRemark ? (
                        <p className="mt-1 max-w-[180px] truncate text-xs text-muted-foreground">
                          {item.adminRemark}
                        </p>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell>{formatAdminIsoDate(item.createdAt)}</AdminTableCell>
                    {canAdjust ? (
                      <AdminTableCell>
                        {item.status === 'pending' ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={actingId === item.id}
                              onClick={() => void handleApprove(item)}
                            >
                              审核入账
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={actingId === item.id}
                              onClick={() => setRejectingTransfer(item)}
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

      {canAdjust ? (
        <BillingWireTransferRejectSheet
          transfer={rejectingTransfer}
          open={rejectingTransfer !== null}
          onOpenChange={(open) => {
            if (!open) setRejectingTransfer(null)
          }}
        />
      ) : null}
      </div>
      {confirmDialog}
    </>
  )
}
