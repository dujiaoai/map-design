import type { NotificationItem } from './mock-notifications'

export function mergeNotificationItems(
  billingItems: NotificationItem[],
  mockItems: NotificationItem[],
) {
  return [...billingItems, ...mockItems].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )
}
