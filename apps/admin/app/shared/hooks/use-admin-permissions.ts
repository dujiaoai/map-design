import { useSession } from '@repo/auth'

import { hasAnyPermission, hasPermission } from '~/shared/auth/admin-access'
import { auth } from '~/shared/auth/client'

export function useAdminPermissions() {
  const session = useSession() ?? auth.getSession()
  return {
    session,
    can: (code: string) => hasPermission(session, code),
    canAny: (codes: string[]) => hasAnyPermission(session, codes),
    tenantId: session?.tenant?.id ?? null,
  }
}
