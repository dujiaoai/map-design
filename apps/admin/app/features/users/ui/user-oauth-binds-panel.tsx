import { Button, toast } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link2OffIcon } from 'lucide-react'

import {
  fetchAdminUserOauthBinds,
  unbindAdminUserOauthProvider,
} from '~/shared/api/admin-api'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminConfigRow, AdminPanel, AdminPanelHeader } from '~/shared/ui/admin-page-shell'

function formatBindTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function UserOauthBindsPanel({
  userId,
  enabled,
}: {
  userId: string
  enabled: boolean
}) {
  const queryClient = useQueryClient()
  const bindsQuery = useQuery({
    queryKey: ['admin', 'users', userId, 'oauth-binds'],
    queryFn: () => fetchAdminUserOauthBinds(userId),
    enabled,
    staleTime: 30_000,
  })

  const unbindMutation = useMutation({
    mutationFn: (providerId: string) => unbindAdminUserOauthProvider(userId, providerId),
    onSuccess: async () => {
      toast.success('已解除 IdP 绑定')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId, 'oauth-binds'] })
    },
    onError: (error) => {
      toast.error(formatAdminApiError(error))
    },
  })

  return (
    <AdminPanel className="mt-2 border-border/60">
      <AdminPanelHeader title="企业 IdP 登录绑定" />
      {bindsQuery.isPending ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">加载中…</p>
      ) : bindsQuery.isError ? (
        <p className="px-4 pb-4 text-sm text-destructive">加载失败</p>
      ) : bindsQuery.data?.binds.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">该用户尚未绑定企业 IdP 账号。</p>
      ) : (
        bindsQuery.data.binds.map((bind) => (
          <AdminConfigRow
            key={bind.providerId}
            label={bind.providerDisplayName}
            value={
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <div className="text-right text-xs text-muted-foreground">
                  {bind.emailSnapshot ? <p>{bind.emailSnapshot}</p> : null}
                  <p>最近使用 {formatBindTime(bind.lastUsedAt)}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unbindMutation.isPending}
                  onClick={() => {
                    unbindMutation.mutate(bind.providerId)
                  }}
                >
                  <Link2OffIcon className="size-3.5" />
                  代理解绑
                </Button>
              </div>
            }
          />
        ))
      )}
    </AdminPanel>
  )
}
