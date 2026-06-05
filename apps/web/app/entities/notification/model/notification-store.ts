import { create } from 'zustand'

import { mockNotifications, type NotificationItem } from './mock-notifications'

interface NotificationStore {
  items: NotificationItem[]
  markRead: (id: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  items: mockNotifications,

  markRead(id) {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    }))
  },

  markAllRead() {
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
    }))
  },
}))

export function selectUnreadNotificationCount(items: NotificationItem[]): number {
  return items.filter((item) => !item.read).length
}
