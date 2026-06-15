import { useEffect } from 'react'

import { mapBillingNotification } from '~/features/billing/lib/billing-notifications'
import { useBillingNotificationsQuery } from '~/shared/queries/billing-queries'
import { useNotificationStore } from '~/entities/notification'

/** 将会员计费通知同步到 workspace 通知抽屉（与 mock 通知合并展示）。 */
export function BillingNotificationSync() {
  const query = useBillingNotificationsQuery()
  const setBillingItems = useNotificationStore((state) => state.setBillingItems)

  useEffect(() => {
    if (!query.data) return
    setBillingItems(query.data.items.map(mapBillingNotification))
  }, [query.data, setBillingItems])

  return null
}
