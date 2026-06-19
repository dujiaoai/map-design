import { useQuery } from '@tanstack/react-query'
import {
  LayoutListIcon,
  PencilIcon,
  PlusIcon,
  UploadIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  menuOverrideEnabledLabel,
  menuOverrideEnabledLevel,
} from '~/features/tenants/lib/menu-override-options'
import { TenantMenuOverrideBatchSheet } from '~/features/tenants/ui/tenant-menu-override-batch-sheet'
import { TenantMenuOverrideSheet } from '~/features/tenants/ui/tenant-menu-override-sheet'
import type { TenantMenuOverride } from '~/entities/tenant/model'
import { fetchTenantMenuOverrides } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminMetricCard } from '~/shared/ui/admin-metric-card'
import {
  AdminEmptyState,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminStatusPill } from '~/shared/ui/admin-status-pill'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { Button, cn } from '@repo/ui'

export function TenantMenuOverridesPanel({
  tenantId,
  canWrite,
}: {
  tenantId: string
  canWrite: boolean
}) {
  const [menuOverrideSheet, setMenuOverrideSheet] = useState<{
    open: boolean
    override: TenantMenuOverride | null
  }>({ open: false, override: null })
  const [batchSheetOpen, setBatchSheetOpen] = useState(false)

  const menuOverridesQuery = useQuery({
    queryKey: adminQueryKeys.tenantMenuOverrides(tenantId),
    queryFn: () => fetchTenantMenuOverrides(tenantId),
  })

  const overrides = menuOverridesQuery.data?.overrides ?? []
  const stats = useMemo(() => {
    let forcedOn = 0
    let forcedOff = 0
    let inheritOnly = 0
    for (const row of overrides) {
      if (row.enabled === true) forcedOn += 1
      else if (row.enabled === false) forcedOff += 1
      else inheritOnly += 1
    }
    return { total: overrides.length, forcedOn, forcedOff, inheritOnly }
  }, [overrides])

  function openCreate() {
    setMenuOverrideSheet({ open: true, override: null })
  }

  return (
    <>
      <AdminPanel>
        <AdminPanelHeader
          icon={LayoutListIcon}
          title="菜单覆盖"
          description="相对平台模板的租户级 diff（Phase 6-2）"
          actions={
            canWrite ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setBatchSheetOpen(true)}
                >
                  <UploadIcon className="size-4" aria-hidden />
                  批量导入
                </Button>
                <Button type="button" size="sm" onClick={openCreate}>
                  <PlusIcon className="size-4" aria-hidden />
                  新增覆盖
                </Button>
              </div>
            ) : null
          }
        />

        {menuOverridesQuery.isLoading ? (
          <AdminTableSkeleton rows={2} columns={1} />
        ) : menuOverridesQuery.isError ? (
          <AdminEmptyState
            icon={LayoutListIcon}
            message="无法加载菜单覆盖"
            onRetry={() => void menuOverridesQuery.refetch()}
            isRetrying={menuOverridesQuery.isFetching}
          />
        ) : (
          <>
            <div className="grid gap-2 px-4 pt-1 pb-3 sm:grid-cols-3">
              <AdminMetricCard
                icon={LayoutListIcon}
                label="覆盖项"
                value={stats.total}
                hint="已写入租户 diff 的菜单项"
              />
              <AdminMetricCard
                label="强制启用"
                value={stats.forcedOn}
                hint="租户侧始终展示"
              />
              <AdminMetricCard
                label="强制禁用"
                value={stats.forcedOff}
                hint="租户侧隐藏"
              />
            </div>

            {!overrides.length ? (
              <AdminEmptyState
                icon={LayoutListIcon}
                message="无覆盖项，全部继承平台模板"
                action={
                  canWrite ? (
                    <Button type="button" size="sm" onClick={openCreate}>
                      <PlusIcon className="size-4" aria-hidden />
                      新增第一条覆盖
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
                {overrides.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      disabled={!canWrite}
                      onClick={() => setMenuOverrideSheet({ open: true, override: row })}
                      className={cn(
                        'admin-menu-override-card group w-full rounded-xl border border-border/60 bg-card/40 p-4 text-left transition-all',
                        canWrite &&
                          'cursor-pointer hover:border-primary/30 hover:bg-card/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        !canWrite && 'cursor-default opacity-90',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-mono text-xs font-medium text-primary">{row.itemId}</p>
                        {canWrite ? (
                          <PencilIcon
                            className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            aria-hidden
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-sm">
                        {row.title?.trim() || '标题继承模板'}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <AdminStatusPill
                          level={menuOverrideEnabledLevel(row.enabled)}
                          label={menuOverrideEnabledLabel(row.enabled)}
                        />
                        {row.sortOrder != null ? (
                          <span className="font-mono text-[11px] text-muted-foreground">
                            sort #{row.sortOrder}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">排序继承</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </AdminPanel>

      <TenantMenuOverrideSheet
        tenantId={tenantId}
        override={menuOverrideSheet.override}
        open={menuOverrideSheet.open}
        onOpenChange={(open) => setMenuOverrideSheet((prev) => ({ ...prev, open }))}
      />
      <TenantMenuOverrideBatchSheet
        tenantId={tenantId}
        open={batchSheetOpen}
        onOpenChange={setBatchSheetOpen}
      />
    </>
  )
}
