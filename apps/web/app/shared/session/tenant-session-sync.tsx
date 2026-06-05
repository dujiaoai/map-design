import { useEffect, useRef } from 'react'

import { useTenant } from '@repo/auth'

import { bootstrapAuthenticatedApp } from '~/shared/session/bootstrap-authenticated-app'
import { invalidateSessionQueries } from '~/shared/queries/invalidate-session-queries'

/** 租户切换后重新 bootstrap 用户与菜单（多租户 SaaS 长期规范） */
export function TenantSessionSync() {
  const { tenant } = useTenant()
  const previousTenantId = useRef<string | undefined>(tenant?.id)

  useEffect(() => {
    const currentId = tenant?.id
    if (previousTenantId.current !== undefined && previousTenantId.current !== currentId) {
      void invalidateSessionQueries().then(() => bootstrapAuthenticatedApp())
    }
    previousTenantId.current = currentId
  }, [tenant?.id])

  return null
}
