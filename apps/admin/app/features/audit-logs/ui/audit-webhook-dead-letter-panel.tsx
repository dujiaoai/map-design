import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TableColumnsType } from 'antd'
import { AlertTriangleIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { buildAuditLogDetailHref } from '~/features/audit-logs/lib/audit-log-nav'

import {
  deleteAdminAuditWebhookDeadLetter,
  fetchAdminAuditWebhookDeadLetters,
  replayAdminAuditWebhookDeadLetter,
  type AdminAuditWebhookDeadLetter,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminAntTable, ADMIN_LIST_TABLE_BODY_HEIGHT } from '~/shared/ant'
import { AdminEmptyState, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'
import { Button, toast } from '@repo/ui'

export function AuditWebhookDeadLetterPanel({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const pageSize = 10

  const query = useQuery({
    queryKey: adminQueryKeys.auditWebhookDeadLetters({ page, size: pageSize }),
    queryFn: () => fetchAdminAuditWebhookDeadLetters({ page, size: pageSize }),
    staleTime: 30_000,
  })

  const replayMutation = useMutation({
    mutationFn: (id: string) => replayAdminAuditWebhookDeadLetter(id),
    onSuccess: async (result) => {
      if (result.success) {
        toast.success('死信重放成功')
      } else {
        toast.error(result.message || '重放失败')
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'audit-webhook-dead-letters'] })
    },
    onError: (error) => toast.error(formatAdminApiError(error, '重放失败')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminAuditWebhookDeadLetter(id),
    onSuccess: async () => {
      toast.success('已删除死信')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'audit-webhook-dead-letters'] })
    },
    onError: (error) => toast.error(formatAdminApiError(error, '删除失败')),
  })

  const columns = useMemo<TableColumnsType<AdminAuditWebhookDeadLetter>>(
    () => [
      {
        title: '日志 ID',
        dataIndex: 'logId',
        key: 'logId',
        render: (logId: string) => (
          <Link
            to={buildAuditLogDetailHref(logId)}
            className="font-mono text-xs text-primary underline-offset-4 hover:underline"
          >
            {logId.slice(0, 8)}…
          </Link>
        ),
      },
      {
        title: '重试',
        dataIndex: 'attempts',
        key: 'attempts',
        width: 64,
      },
      {
        title: '错误',
        dataIndex: 'lastError',
        key: 'lastError',
        ellipsis: true,
        render: (lastError: string | null) => lastError ?? '—',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (createdAt: number) => (
          <span className="text-muted-foreground">{formatAdminDate(createdAt)}</span>
        ),
      },
      ...(canManage
        ? [
            {
              title: '操作',
              key: 'actions',
              width: 140,
              render: (_value: unknown, row: AdminAuditWebhookDeadLetter) => (
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={replayMutation.isPending}
                    onClick={() => void replayMutation.mutate(row.id)}
                  >
                    <RotateCcwIcon className="size-3.5" />
                    重放
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => void deleteMutation.mutate(row.id)}
                  >
                    <Trash2Icon className="size-3.5" />
                    删除
                  </Button>
                </div>
              ),
            } satisfies TableColumnsType<AdminAuditWebhookDeadLetter>[number],
          ]
        : []),
    ],
    [canManage, deleteMutation.isPending, replayMutation.isPending],
  )

  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0

  return (
    <AdminPanel>
      <AdminPanelHeader
        icon={AlertTriangleIcon}
        title="Webhook 死信"
        description="SIEM 投递失败的事件副本；可手动重放或丢弃"
      />
      {query.isLoading ? (
        <AdminTableSkeleton columns={5} showPagination />
      ) : query.isError ? (
        <AdminEmptyState
          message="无法加载死信列表"
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : !items.length ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">暂无死信</p>
      ) : (
        <AdminAntTable<AdminAuditWebhookDeadLetter>
          bodyHeight={ADMIN_LIST_TABLE_BODY_HEIGHT}
          rowKey="id"
          columns={columns}
          dataSource={items}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
          }}
        />
      )}
    </AdminPanel>
  )
}
