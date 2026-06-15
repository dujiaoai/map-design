import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, toast, useConfirmDialog } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  adminBillingPackagesQuery,
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
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

const PAGE_SIZE = 20

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
  const [appliedCodeSearch, setAppliedCodeSearch] = useState('')
  const [page, setPage] = useState(0)
  const { confirm, confirmDialog } = useConfirmDialog()

  const filters = { status: statusFilter, code: appliedCodeSearch }

  const query = useQuery({
    queryKey: billingAdminQueryKeys.packages(filters, page),
    queryFn: async () =>
      adminPackageListSchema.parse(
        await billingAdminApi.get(
          `/packages${adminBillingPackagesQuery({ ...filters, page, size: PAGE_SIZE })}`,
        ),
      ),
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
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [...billingAdminQueryKeys.all, 'packages'],
      })
      toast.success(variables.status === 'active' ? 'SKU 已上架' : 'SKU 已下架')
    },
    onSettled: () => {
      setPendingCode(null)
    },
  })

  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const errorMessage = query.error ? formatAdminApiError(query.error) : null
  const actionError = statusMutation.error ? formatAdminApiError(statusMutation.error) : null

  function clearPackageFilters() {
    setStatusFilter('all')
    setCodeSearch('')
    setAppliedCodeSearch('')
    setPage(0)
  }

  const hasPackageFilters = statusFilter !== 'all' || appliedCodeSearch.length > 0

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
          <div className="grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
            <AdminField label="搜索代码">
              <Input
                value={codeSearch}
                onChange={(event) => setCodeSearch(event.target.value)}
                placeholder="pkg_1000"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setAppliedCodeSearch(codeSearch.trim())
                    setPage(0)
                  }
                }}
              />
            </AdminField>
            <AdminField label="状态">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value ?? 'all')
                  setPage(0)
                }}
              >
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAppliedCodeSearch(codeSearch.trim())
                setPage(0)
              }}
            >
              查询
            </Button>
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
            <AdminEmptyState
              message={errorMessage}
              onRetry={() => void query.refetch()}
              isRetrying={query.isFetching}
            />
          ) : items.length === 0 ? (
            hasPackageFilters ? (
              <AdminEmptyState
                message="暂无匹配 SKU。"
                action={
                  <Button type="button" variant="outline" size="sm" onClick={clearPackageFilters}>
                    清除筛选
                  </Button>
                }
              />
            ) : (
              <AdminEmptyState message="暂无 SKU。" />
            )
          ) : (
            <>
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
                  {items.map((pkg) => (
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
              <AdminTablePagination
                page={page + 1}
                pageSize={PAGE_SIZE}
                total={total}
                onPageChange={(next) => setPage(next - 1)}
              />
            </>
          )}
        </div>
      </AdminPanel>
      {confirmDialog}
    </>
  )
}
