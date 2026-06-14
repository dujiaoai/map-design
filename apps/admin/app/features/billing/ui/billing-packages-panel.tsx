import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useConfirmDialog } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import {
  adminPackageListSchema,
  adminPackageSchema,
  type AdminPackage,
} from '~/features/billing/lib/billing-admin-api'
import { formatBillingPrice } from '~/features/billing/lib/billing-format'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
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
import { AdminStatusBadge } from '~/shared/ui/admin-status-badge'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

const PACKAGE_STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '已下架' },
] as const

export function BillingPackagesPanel({
  canWrite = false,
  onCreatePackage,
  onEditPackage,
}: {
  canWrite?: boolean
  onCreatePackage?: () => void
  onEditPackage?: (pkg: AdminPackage) => void
}) {
  const queryClient = useQueryClient()
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [codeSearch, setCodeSearch] = useState('')
  const { confirm, confirmDialog } = useConfirmDialog()

  const query = useQuery({
    queryKey: billingAdminQueryKeys.packages(),
    queryFn: async () =>
      adminPackageListSchema.parse(await billingAdminApi.get('/packages')),
  })

  const statusMutation = useMutation({
    mutationFn: async ({
      pkg,
      status,
    }: {
      pkg: AdminPackage
      status: 'active' | 'inactive'
    }) => {
      setPendingCode(pkg.code)
      return adminPackageSchema.parse(
        await billingAdminApi.patch(`/packages/${encodeURIComponent(pkg.code)}`, {
          status,
        }),
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingAdminQueryKeys.packages() })
    },
    onSettled: () => {
      setPendingCode(null)
    },
  })

  const filteredItems = useMemo(() => {
    const items = query.data?.items ?? []
    const needle = codeSearch.trim().toLowerCase()
    return items
      .filter((pkg) => {
        if (statusFilter !== 'all' && pkg.status !== statusFilter) return false
        if (needle && !pkg.code.toLowerCase().includes(needle)) return false
        return true
      })
      .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
  }, [query.data?.items, statusFilter, codeSearch])

  const errorMessage = query.error ? formatAdminApiError(query.error) : null
  const actionError = statusMutation.error ? formatAdminApiError(statusMutation.error) : null

  return (
    <>
      <AdminPanel>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
          <div>
            <h3 className="text-base font-medium">充值 SKU</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              平台价目表（含 inactive）；下架后前台不再展示，可快捷上架恢复。
            </p>
          </div>
          {canWrite && onCreatePackage ? (
            <Button type="button" size="sm" onClick={onCreatePackage}>
              新建 SKU
            </Button>
          ) : null}
        </div>
        <div className="border-b border-border/60 px-6 py-4">
          <div className="grid items-center justify-center gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
            <AdminField label="搜索代码">
              <Input
                value={codeSearch}
                onChange={(event) => setCodeSearch(event.target.value)}
                placeholder="pkg_1000"
              />
            </AdminField>
            <AdminField label="状态">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? 'all')} >
                <SelectTrigger className="w-full mb-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminField>
          </div>
        </div>
        <div className="px-2 py-2">
          {actionError ? (
            <div className="px-4 pb-2">
              <AdminFormError message={actionError} />
            </div>
          ) : null}
          {query.isLoading ? (
            <AdminTableSkeleton columns={canWrite ? 7 : 6} />
          ) : errorMessage ? (
            <AdminEmptyState message={errorMessage} />
          ) : filteredItems.length === 0 ? (
            <AdminEmptyState message="暂无匹配 SKU。" />
          ) : (
            <>
              <p className="px-4 pb-2 text-sm text-muted-foreground">
                共 {filteredItems.length} 个 SKU
                {query.data ? `（总计 ${query.data.items.length}）` : null}
              </p>
              <AdminDataTable>
                <AdminTableHead>
                  <AdminTableRow>
                    <AdminTableHeaderCell>代码</AdminTableHeaderCell>
                    <AdminTableHeaderCell>积分</AdminTableHeaderCell>
                    <AdminTableHeaderCell>售价</AdminTableHeaderCell>
                    <AdminTableHeaderCell>状态</AdminTableHeaderCell>
                    <AdminTableHeaderCell>排序</AdminTableHeaderCell>
                    {canWrite ? <AdminTableHeaderCell>操作</AdminTableHeaderCell> : null}
                  </AdminTableRow>
                </AdminTableHead>
                <AdminTableBody>
                  {filteredItems.map((pkg) => (
                    <AdminTableRow key={pkg.id}>
                      <AdminTableCell>
                        <AdminIdCell value={pkg.code} label="SKU 代码" />
                      </AdminTableCell>
                      <AdminTableCell>{pkg.points.toLocaleString('zh-CN')}</AdminTableCell>
                      <AdminTableCell>{formatBillingPrice(pkg.priceCents, pkg.currency)}</AdminTableCell>
                      <AdminTableCell>
                        <AdminStatusBadge status={pkg.status} />
                      </AdminTableCell>
                      <AdminTableCell>{pkg.sortOrder}</AdminTableCell>
                      {canWrite ? (
                        <AdminTableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onEditPackage?.(pkg)}
                            >
                              编辑
                            </Button>
                            {pkg.status === 'active' ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={statusMutation.isPending}
                                onClick={async () => {
                                  const confirmed = await confirm({
                                    description: `确定下架 SKU「${pkg.code}」？前台充值页将不再展示该套餐。`,
                                    confirmLabel: '下架',
                                  })
                                  if (!confirmed) return
                                  statusMutation.mutate({ pkg, status: 'inactive' })
                                }}
                              >
                                {pendingCode === pkg.code && statusMutation.isPending
                                  ? '下架中…'
                                  : '下架'}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={statusMutation.isPending}
                                onClick={async () => {
                                  const confirmed = await confirm({
                                    description: `确定上架 SKU「${pkg.code}」？前台充值页将重新展示该套餐。`,
                                    confirmLabel: '上架',
                                  })
                                  if (!confirmed) return
                                  statusMutation.mutate({ pkg, status: 'active' })
                                }}
                              >
                                {pendingCode === pkg.code && statusMutation.isPending
                                  ? '上架中…'
                                  : '上架'}
                              </Button>
                            )}
                          </div>
                        </AdminTableCell>
                      ) : null}
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminDataTable>
            </>
          )}
        </div>
      </AdminPanel>
      {confirmDialog}
    </>
  )
}
