import type { BillingNotification } from '@repo/billing-client'

import type { NotificationItem } from '~/entities/notification'

export const BILLING_NOTIFICATION_ID_PREFIX = 'billing:'

export function toBillingNotificationItemId(id: string) {
  return `${BILLING_NOTIFICATION_ID_PREFIX}${id}`
}

export function isBillingNotificationItemId(id: string) {
  return id.startsWith(BILLING_NOTIFICATION_ID_PREFIX)
}

export function parseBillingNotificationItemId(id: string) {
  return id.slice(BILLING_NOTIFICATION_ID_PREFIX.length)
}

export function mapBillingNotification(item: BillingNotification): NotificationItem {
  return {
    id: toBillingNotificationItemId(item.id),
    title: item.title,
    content: item.body,
    type: item.category === 'low_balance' ? 'alert' : 'system',
    read: item.read,
    createdAt: formatBillingNotificationDate(item.createdAt),
  }
}

export function formatBillingNotificationDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}