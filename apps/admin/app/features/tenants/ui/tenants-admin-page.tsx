import { Button } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { EyeIcon, PencilIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { fetchAdminTenants, type AdminTenantSummary } from '~/shared/api/admin-api'
import {
  useAdminTableFilterState,
  useFilteredAdminRows,
} from '~/shared/hooks/use-admin-table-filter'
import { useAdminPermissions } from '~/shared/hooks/use-admin-permissions'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import {
  AdminDataTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
} from '~/shared/ui/admin-data-table'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTableToolbar } from '~/shared/ui/admin-table-toolbar'
import { AdminStatusBadge, formatAdminDate } from '~/shared/ui/admin-status-badge'

import { CreateTenantSheet } from './create-tenant-sheet'
import { EditTenantSheet } from './edit-tenant-sheet'

export function TenantsAdminPage() {
  const { can } = useAdminPermissions()
  const canWrite = can('admin:tenants:write')
  const canReadUsers = can('admin:users:read')

  const [createOpen, setCreateOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<AdminTenantSummary | null>(null)

  const query = useQuery({ queryKey: adminQueryKeys.tenants, queryFn: fetchAdminTenants })
  const filter = useAdminTableFilterState()
  const tenantSearchKeys: (keyof AdminTenantSummary)[] = ['name', 'slug', 'plan']
  const filteredTenants = useFilteredAdminRows(
    query.data?.tenants,
    filter,
    tenantSearchKeys,
    'status',
  )

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="租户"
        description="管理平台全部租户；停用后该租户用户无法登录。"
        actions={
          canWrite ? (
            <Button onClick={() => setCreateOpen(true)}>新建租户</Button>
          ) : null
        }
      />

      <AdminTableToolbar
        search={filter.search}
        onSearchChange={filter.setSearch}
        searchPlaceholder="搜索名称或 slug…"
        status={filter.status}
        onStatusChange={filter.setStatus}
        statusOptions={[
          { value: 'all', label: '全部状态' },
          { value: 'active', label: 'active' },
          { value: 'suspended', label: 'suspended' },
        ]}
      />

      <AdminPanel>
        {query.isLoading ? (
          <AdminEmptyState message="加载中…" />
        ) : query.isError ? (
          <AdminEmptyState message="加载失败，请刷新重试" />
        ) : !query.data?.tenants.length ? (
          <AdminEmptyState message="暂无租户" />
        ) : !filteredTenants.length ? (
          <AdminEmptyState message="无匹配租户" />
        ) : (
          <AdminDataTable>
            <AdminTableHead>
              <tr>
                <AdminTableHeaderCell>名称</AdminTableHeaderCell>
                <AdminTableHeaderCell>Slug</AdminTableHeaderCell>
                <AdminTableHeaderCell>计划</AdminTableHeaderCell>
                <AdminTableHeaderCell>状态</AdminTableHeaderCell>
                <AdminTableHeaderCell>创建时间</AdminTableHeaderCell>
                <AdminTableHeaderCell className="text-right">操作</AdminTableHeaderCell>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {filteredTenants.map((tenant) => (
                <AdminTableRow key={tenant.id}>
                  <AdminTableCell>{tenant.name}</AdminTableCell>
                  <AdminTableCell mono>{tenant.slug}</AdminTableCell>
                  <AdminTableCell mono>{tenant.plan}</AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusBadge status={tenant.status} />
                  </AdminTableCell>
                  <AdminTableCell className="text-muted-foreground">
                    {formatAdminDate(tenant.createdAt)}
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={<Link to={`/tenants/${tenant.id}`} />}
                      >
                        <EyeIcon className="size-3.5" />
                        详情
                      </Button>
                      {canReadUsers ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          nativeButton={false}
                          render={<Link to={`/users?tenantId=${tenant.id}`} />}
                        >
                          <UsersIcon className="size-3.5" />
                          用户
                        </Button>
                      ) : null}
                      {canWrite ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTenant(tenant)}
                        >
                          <PencilIcon className="size-3.5" />
                          编辑
                        </Button>
                      ) : null}
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminDataTable>
        )}
      </AdminPanel>

      <CreateTenantSheet open={createOpen} onOpenChange={setCreateOpen} />
      <EditTenantSheet
        tenant={editingTenant}
        open={Boolean(editingTenant)}
        onOpenChange={(open) => {
          if (!open) setEditingTenant(null)
        }}
      />
    </div>
  )
}
