import { useEffect, useRef } from 'react'

export type BillingFilterSeed = {
  tenantId?: string
  userId?: string
}

/** 从 URL 注入 tenantId / userId 筛选，同一 seed 只应用一次。 */
export function useBillingFilterSeed(
  filterSeed: BillingFilterSeed | undefined,
  apply: (seed: BillingFilterSeed) => void,
) {
  const appliedKeyRef = useRef('')

  useEffect(() => {
    const tenantId = filterSeed?.tenantId?.trim()
    const userId = filterSeed?.userId?.trim()
    if (!tenantId && !userId) return

    const key = `${tenantId ?? ''}:${userId ?? ''}`
    if (appliedKeyRef.current === key) return
    appliedKeyRef.current = key

    apply({ tenantId, userId })
  }, [filterSeed?.tenantId, filterSeed?.userId, apply])
}
