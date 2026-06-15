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

export const useNotificationStore = create<NotificationStore>((set) => ({
  mockItems: mockNotifications,
  billingItems: [],

  setBillingItems(items) {
    set({ billingItems: items })
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

export function selectUnreadNotificationCount(items: NotificationItem[]): number {
  return items.filter((item) => !item.read).length
}
