import { describe, expect, it } from 'vitest'

import {
  formatBillingNotificationDate,
  isBillingNotificationItemId,
  mapBillingNotification,
  parseBillingNotificationItemId,
  toBillingNotificationItemId,
} from './billing-notifications'

describe('billing-notifications', () => {
  it('maps low balance notification to alert item', () => {
    const item = mapBillingNotification({
      id: 'n1',
      category: 'low_balance',
      title: '积分余额偏低',
      body: '请及时充值',
      read: false,
      createdAt: '2026-06-15T02:00:00Z',
    })
    expect(item.type).toBe('alert')
    expect(item.id).toBe('billing:n1')
  })

  it('parses billing notification ids', () => {
    expect(isBillingNotificationItemId('billing:abc')).toBe(true)
    expect(parseBillingNotificationItemId(toBillingNotificationItemId('abc'))).toBe('abc')
  })

  it('formats ISO dates for zh-CN display', () => {
    expect(formatBillingNotificationDate('2026-06-15T02:00:00Z')).toMatch(/2026/)
  })
})
