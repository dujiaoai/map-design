import { Button } from '@repo/ui'
import { useSession } from '@repo/auth'
import { UserCogIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { stopImpersonation } from '~/shared/api/admin-api'
import { AdminPanel } from '~/shared/ui/admin-page-shell'

import { applyLoginResponse } from '../lib/apply-login-response'

export function AdminImpersonationBanner() {
  const session = useSession()
  const homeTenant = session?.homeTenant
  const [pending, setPending] = useState(false)

  if (!homeTenant || !session?.tenant) {
    return null
  }

  async function handleStop() {
    setPending(true)
    try {
      const response = await stopImpersonation()
      applyLoginResponse(response)
      toast.success('已退出租户代操作')
    } catch {
      toast.error('退出代操作失败，请重试')
    } finally {
      setPending(false)
    }
  }

  return (
    <AdminPanel className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 border-amber-500/30 bg-amber-500/10 px-4 py-3 md:mx-6">
      <p className="flex items-center gap-2 text-sm">
        <UserCogIcon className="size-4 text-amber-400" aria-hidden />
        <span>
          <span className="text-muted-foreground">代操作 · </span>
          当前以 <span className="font-medium">{session.tenant.name}</span> 上下文操作
          <span className="text-muted-foreground">（主租户 {homeTenant.name}）</span>
        </span>
      </p>
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => void handleStop()}>
        退出代操作
      </Button>
    </AdminPanel>
  )
}
