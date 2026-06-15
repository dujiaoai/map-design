import { useEffect, useRef } from 'react'

import { mapBillingNotification } from '~/features/billing/lib/billing-notifications'
import { useBillingNotificationsQuery } from '~/shared/queries/billing-queries'
import { useNotificationStore } from '~/entities/notification'

function billingNotificationSyncKey(items: ReturnType<typeof mapBillingNotification>[]) {
  return items.map((item) => `${item.id}:${item.read}:${item.createdAt}`).join('|')
}

/** 将会员计费通知同步到 workspace 通知抽屉（与 mock 通知合并展示）。 */
export function BillingNotificationSync() {
  const query = useBillingNotificationsQuery()
  const setBillingItems = useNotificationStore((state) => state.setBillingItems)
  const lastSyncedKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!query.data) {
      lastSyncedKeyRef.current = null
      return
    }

    const items = query.data.items.map(mapBillingNotification)
    const syncKey = billingNotificationSyncKey(items)
    if (lastSyncedKeyRef.current === syncKey) {
      return
    }

    lastSyncedKeyRef.current = syncKey
    setBillingItems(items)
  }, [query.data, setBillingItems])

  return null
}
