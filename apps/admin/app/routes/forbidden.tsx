import { Button } from '@repo/ui'
import { useNavigate } from 'react-router'

import { auth } from '~/shared/auth/client'
import { AdminErrorPage } from '~/shared/ui/admin-error-page'

import type { Route } from './+types/forbidden'

export function meta(_args: Route.MetaArgs) {
  return [{ title: '无权访问 · 云眼运营后台' }]
}

export default function ForbiddenRoute() {
  const navigate = useNavigate()

  async function handleBackToLogin() {
    await auth.logout()
    void navigate('/login', { replace: true })
  }

  return (
    <AdminErrorPage
      code="403"
      title="无权访问运营后台"
      description="当前账号缺少 PLATFORM_ADMIN / TENANT_ADMIN 或相应 admin 权限码。"
      actions={<Button onClick={() => void handleBackToLogin()}>返回登录</Button>}
    />
  )
}
