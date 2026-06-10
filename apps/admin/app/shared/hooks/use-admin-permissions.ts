import { useSession } from '@repo/auth'

import { hasAnyPermission, hasPermission } from '~/shared/auth/admin-access'

export function useAdminPermissions() {
  const session = useSession()
  return {
    session,
    can: (code: string) => hasPermission(session, code),
    canAny: (codes: string[]) => hasAnyPermission(session, codes),
    tenantId: session?.tenant?.id ?? null,
  }
}
