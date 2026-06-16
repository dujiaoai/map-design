import { Button, toast } from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link2OffIcon } from 'lucide-react'

import { fetchMyOauthBinds, unbindMyOauthProvider } from '~/shared/api/oauth-binds'

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

  if (bindsQuery.isPending) {
    return <p className="text-muted-foreground mb-4 text-sm">加载登录绑定…</p>
  }

  if (bindsQuery.isError) {
    return <p className="text-destructive mb-4 text-sm">登录绑定加载失败</p>
  }

  const binds = bindsQuery.data?.binds ?? []

  return (
    <div className="mb-4 rounded-lg border px-4 py-3">
      <p className="mb-2 text-sm font-medium">企业 IdP 登录绑定</p>
      {binds.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          尚未绑定企业账号。使用登录页 IdP 按钮成功登录后将自动绑定。
        </p>
      ) : (
        <ul className="space-y-3">
          {binds.map((bind) => (
            <li
              key={bind.providerId}
              className="flex flex-col gap-2 border-b pb-3 text-sm last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium">{bind.providerDisplayName}</p>
                {bind.emailSnapshot ? (
                  <p className="text-muted-foreground truncate text-xs">{bind.emailSnapshot}</p>
                ) : null}
                <p className="text-muted-foreground text-xs">
                  最近使用 {formatBindTime(bind.lastUsedAt)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                disabled={unbindMutation.isPending}
                onClick={() => {
                  unbindMutation.mutate(bind.providerId)
                }}
              >
                <Link2OffIcon className="size-3.5" />
                解除绑定
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
