import { create } from 'zustand'

import { mockNotifications, type NotificationItem } from './mock-notifications'
import { mergeNotificationItems } from './merge-notification-items'

interface NotificationStore {
  mockItems: NotificationItem[]
  billingItems: NotificationItem[]
  setBillingItems: (items: NotificationItem[]) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

function notificationItemsEqual(left: NotificationItem[], right: NotificationItem[]): boolean {
  if (left.length !== right.length) return false
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index]!
    const b = right[index]!
    if (
      a.id !== b.id ||
      a.read !== b.read ||
      a.title !== b.title ||
      a.content !== b.content ||
      a.type !== b.type ||
      a.createdAt !== b.createdAt
    ) {
      return false
    }
  }
  return true
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  mockItems: mockNotifications,
  billingItems: [],

  setBillingItems(items) {
    set((state) => {
      if (notificationItemsEqual(state.billingItems, items)) {
        return state
      }
      return { billingItems: items }
    })
  },

  markRead(id) {
    set((state) => ({
      mockItems: state.mockItems.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
      billingItems: state.billingItems.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    }))
  },

  markAllRead() {
    set((state) => ({
      mockItems: state.mockItems.map((item) => ({ ...item, read: true })),
      billingItems: state.billingItems.map((item) => ({ ...item, read: true })),
    }))
  },
}))

export function selectNotificationItems(state: NotificationStore): NotificationItem[] {
  return mergeNotificationItems(state.billingItems, state.mockItems)
}

/** 未读数 selector：返回原始 number，避免 merge 产生的新数组触发多余重渲染 */
export function selectUnreadNotificationCountFromStore(state: NotificationStore): number {
  const billingUnread = state.billingItems.reduce((count, item) => count + (item.read ? 0 : 1), 0)
  const mockUnread = state.mockItems.reduce((count, item) => count + (item.read ? 0 : 1), 0)
  return billingUnread + mockUnread
}

export function selectUnreadNotificationCount(items: NotificationItem[]): number {
  return items.filter((item) => !item.read).length
}
