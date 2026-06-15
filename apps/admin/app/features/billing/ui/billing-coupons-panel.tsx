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
import { TicketIcon } from 'lucide-react'
import { useId, useState } from 'react'

import {
  adminBillingCouponsQuery,
  adminCouponListSchema,
  adminCouponSchema,
  type AdminCoupon,
} from '~/features/billing/lib/billing-admin-api'
import { billingAdminQueryKeys } from '~/features/billing/lib/billing-admin-query-keys'
import { billingAdminApi } from '~/shared/api/billing-admin-client'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
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
import { AdminTablePagination } from '~/shared/ui/admin-table-pagination'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

const PAGE_SIZE = 20

const COUPON_KIND_OPTIONS = [
  { value: 'gift', label: '赠送积分' },
  { value: 'discount', label: '充值抵扣' },
] as const

const COUPON_STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '生效中' },
  { value: 'inactive', label: '已停用' },
] as const

export function BillingCouponsPanel({ canWrite = false }: { canWrite?: boolean }) {
  const queryClient = useQueryClient()
  const codeInputId = useId()
  const pointsInputId = useId()
  const discountInputId = useId()
  const kindInputId = useId()
  const maxTotalInputId = useId()
  const { confirm, confirmDialog } = useConfirmDialog()

  const [statusFilter, setStatusFilter] = useState('all')
  const [codeSearch, setCodeSearch] = useState('')
  const [appliedCodeSearch, setAppliedCodeSearch] = useState('')
  const [page, setPage] = useState(0)
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const [createCode, setCreateCode] = useState('')
  const [createKind, setCreateKind] = useState<'gift' | 'discount'>('gift')
  const [createPoints, setCreatePoints] = useState('100')
  const [createDiscountCents, setCreateDiscountCents] = useState('1000')
  const [createMaxTotal, setCreateMaxTotal] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  const filters = { status: statusFilter, code: appliedCodeSearch }

  const query = useQuery({
    queryKey: billingAdminQueryKeys.coupons(filters, page),
    queryFn: async () =>
      adminCouponListSchema.parse(
        await billingAdminApi.get(
          `/coupons${adminBillingCouponsQuery({ ...filters, page, size: PAGE_SIZE })}`,
        ),
      ),
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const maxTotal = createMaxTotal.trim()
        ? Number.parseInt(createMaxTotal, 10)
        : undefined
      const body: Record<string, unknown> = {
        code: createCode.trim(),
        kind: createKind,
        maxTotalRedemptions: maxTotal,
        status: 'active',
      }
      if (createKind === 'discount') {
        const discountCents = Number.parseInt(createDiscountCents, 10)
        if (!Number.isFinite(discountCents) || discountCents <= 0) {
          throw new Error('抵扣金额须为正整数（分）')
        }
        body.discountCents = discountCents
        body.points = 1
      } else {
        const points = Number.parseInt(createPoints, 10)
        if (!Number.isFinite(points) || points <= 0) {
          throw new Error('积分须为正整数')
        }
        body.points = points
      }
      return adminCouponSchema.parse(await billingAdminApi.post('/coupons', body))
    },
    onSuccess: async () => {
      setCreateCode('')
      setCreateKind('gift')
      setCreatePoints('100')
      setCreateDiscountCents('1000')
      setCreateMaxTotal('')
      setCreateError(null)
      await queryClient.invalidateQueries({
        queryKey: [...billingAdminQueryKeys.all, 'coupons'],
      })
    },
    onError: (error) => {
      setCreateError(formatAdminApiError(error))
    },
  })

  const statusMutation = useMutation({
    mutationFn: async ({
      coupon,
      status,
    }: {
      coupon: AdminCoupon
      status: 'active' | 'inactive'
    }) => {
      setPendingCode(coupon.code)
      return adminCouponSchema.parse(
        await billingAdminApi.patch(`/coupons/${encodeURIComponent(coupon.code)}`, {
          status,
        }),
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...billingAdminQueryKeys.all, 'coupons'],
      })
    },
    onSettled: () => {
      setPendingCode(null)
    },
  })

  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const errorMessage = query.error ? formatAdminApiError(query.error) : null

  return (
    <div className="space-y-4">
      {confirmDialog}
      <AdminPanel>
        <div className="border-b border-border/60 px-6 py-5">
          <div className="flex items-start gap-3">
            <TicketIcon className="mt-0.5 size-4 text-muted-foreground" />
            <div>
              <h3 className="text-base font-medium">优惠券</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                赠送积分券用于兑换入口；充值抵扣券在下单时减免应付金额。
              </p>
            </div>
          </div>
        </div>
        {canWrite ? (
          <div className="grid gap-3 border-b border-border/60 px-6 py-5 sm:grid-cols-2 lg:grid-cols-5">
            <AdminField label="兑换码" htmlFor={codeInputId}>
              <Input
                id={codeInputId}
                value={createCode}
                onChange={(event) => setCreateCode(event.target.value.toUpperCase())}
                placeholder="WELCOME100"
              />
            </AdminField>
            <AdminField label="类型" htmlFor={kindInputId}>
              <Select
                value={createKind}
                onValueChange={(value) => setCreateKind(value as 'gift' | 'discount')}
              >
                <SelectTrigger id={kindInputId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUPON_KIND_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminField>
            {createKind === 'gift' ? (
              <AdminField label="赠送积分" htmlFor={pointsInputId}>
                <Input
                  id={pointsInputId}
                  type="number"
                  min={1}
                  value={createPoints}
                  onChange={(event) => setCreatePoints(event.target.value)}
                />
              </AdminField>
            ) : (
              <AdminField label="抵扣金额（分）" htmlFor={discountInputId}>
                <Input
                  id={discountInputId}
                  type="number"
                  min={1}
                  value={createDiscountCents}
                  onChange={(event) => setCreateDiscountCents(event.target.value)}
                />
              </AdminField>
            )}
            <AdminField label="总兑换上限（可选）" htmlFor={maxTotalInputId}>
              <Input
                id={maxTotalInputId}
                type="number"
                min={1}
                value={createMaxTotal}
                onChange={(event) => setCreateMaxTotal(event.target.value)}
                placeholder="不限"
              />
            </AdminField>
            <div className="flex items-end">
              <Button
                type="button"
                size="sm"
                disabled={createMutation.isPending || !createCode.trim()}
                onClick={() => void createMutation.mutateAsync()}
              >
                创建优惠券
              </Button>
            </div>
            {createError ? (
              <div className="sm:col-span-2 lg:col-span-5">
                <AdminFormError message={createError} />
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap items-end gap-3 border-b border-border/60 px-6 py-5">
          <AdminField label="搜索兑换码">
            <Input
              value={codeSearch}
              onChange={(event) => setCodeSearch(event.target.value)}
              placeholder="WELCOME"
              className="w-[180px]"
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
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUPON_STATUS_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
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
      </AdminPanel>

      <AdminPanel>
        {query.isLoading ? (
          <div className="px-6 py-5">
            <AdminTableSkeleton columns={6} rows={4} />
          </div>
        ) : errorMessage ? (
          <div className="px-6 py-5">
            <AdminEmptyState message={errorMessage} />
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-5">
            <AdminEmptyState message="暂无优惠券" />
          </div>
        ) : (
          <>
            <AdminDataTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeaderCell>兑换码</AdminTableHeaderCell>
                <AdminTableHeaderCell>类型</AdminTableHeaderCell>
                <AdminTableHeaderCell>权益</AdminTableHeaderCell>
                <AdminTableHeaderCell>已兑换 / 上限</AdminTableHeaderCell>
                <AdminTableHeaderCell>状态</AdminTableHeaderCell>
                <AdminTableHeaderCell>有效期</AdminTableHeaderCell>
                {canWrite ? <AdminTableHeaderCell>操作</AdminTableHeaderCell> : null}
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {items.map((coupon) => (
                <AdminTableRow key={coupon.id}>
                  <AdminTableCell className="font-mono text-xs">{coupon.code}</AdminTableCell>
                  <AdminTableCell>
                    {coupon.kind === 'discount' ? '充值抵扣' : '赠送积分'}
                  </AdminTableCell>
                  <AdminTableCell>
                    {coupon.kind === 'discount' && coupon.discountCents
                      ? `减 ¥${(coupon.discountCents / 100).toFixed(2)}`
                      : `${coupon.points.toLocaleString('zh-CN')} 点`}
                  </AdminTableCell>
                  <AdminTableCell>
                    {coupon.redemptionCount}
                    {coupon.maxTotalRedemptions != null
                      ? ` / ${coupon.maxTotalRedemptions}`
                      : ' / 不限'}
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge
                      status={coupon.status}
                      label={coupon.status === 'active' ? '生效中' : '已停用'}
                    />
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground text-xs">
                    {coupon.validUntil ? formatAdminIsoDate(coupon.validUntil) : '—'}
                  </AdminTableCell>
                  {canWrite ? (
                    <AdminTableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pendingCode === coupon.code}
                        onClick={async () => {
                          const nextStatus =
                            coupon.status === 'active' ? 'inactive' : 'active'
                          const confirmed = await confirm({
                            description: `确认将 ${coupon.code} 设为${nextStatus === 'inactive' ? '停用' : '生效'}？`,
                            confirmLabel: '确认',
                          })
                          if (!confirmed) return
                          void statusMutation.mutateAsync({ coupon, status: nextStatus })
                        }}
                      >
                        {coupon.status === 'active' ? '停用' : '启用'}
                      </Button>
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
      </AdminPanel>
    </div>
  )
}
