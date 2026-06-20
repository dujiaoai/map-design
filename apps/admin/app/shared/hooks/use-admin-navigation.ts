import { useQuery } from '@tanstack/react-query'

import { fetchAdminNavigation } from '~/entities/admin-platform/api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { buildAdminNavSections } from '~/widgets/admin-shell/lib/build-admin-nav-sections'

import type { Session } from '@repo/auth'

import { useAdminProductContext } from './use-admin-product-context'

/** 优先 API 导航；失败或未加载时 fallback 静态 registry。 */
export function useAdminNavigation(pathname: string, session: Session | null) {
  const { productCode } = useAdminProductContext()
  const query = useQuery({
    queryKey: adminQueryKeys.navigation(productCode),
    queryFn: () => fetchAdminNavigation(productCode),
    staleTime: 300_000,
    retry: false,
  })

  const fallbackSections = buildAdminNavSections(pathname, session, productCode)

  return {
    productCode,
    navigationQuery: query,
    navMapSections: fallbackSections,
    apiNavigation: query.data ?? null,
  }
}
