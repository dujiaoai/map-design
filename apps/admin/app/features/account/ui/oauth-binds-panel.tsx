import { Button, toast } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link2OffIcon } from 'lucide-react'

import { fetchMyOauthBinds, unbindMyOauthProvider } from '~/shared/api/oauth-binds'
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

export function OauthBindsPanel() {
  const queryClient = useQueryClient()
  const bindsQuery = useQuery({
    queryKey: ['users', 'me', 'oauth-binds'],
    queryFn: fetchMyOauthBinds,
    staleTime: 30_000,
  })

  const unbindMutation = useMutation({
    mutationFn: unbindMyOauthProvider,
    onSuccess: async () => {
      toast.success('已解除 IdP 绑定')
      await queryClient.invalidateQueries({ queryKey: ['users', 'me', 'oauth-binds'] })
    },
    onError: () => {
      toast.error('解绑失败，请稍后重试')
    },
  })

  return (
    <AdminPanel className="mb-4">
      <AdminPanelHeader title="企业 IdP 登录绑定" />
      {bindsQuery.isPending ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">加载中…</p>
      ) : bindsQuery.isError ? (
        <p className="px-4 pb-4 text-sm text-destructive">加载失败</p>
      ) : bindsQuery.data?.binds.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">
          尚未绑定企业账号。使用登录页 IdP 按钮成功登录后将自动绑定。
        </p>
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
                  解除绑定
                </Button>
              </div>
            }
          />
        ))
      )}
    </AdminPanel>
  )
}
