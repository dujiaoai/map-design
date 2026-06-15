import { Button, cn } from '@repo/ui'
import { useState } from 'react'

import {
  isBillingNotificationItemId,
  parseBillingNotificationItemId,
} from '~/features/billing/lib/billing-notifications'
import { billingClient } from '~/shared/api/billing-client'
import {
  NOTIFICATION_TYPE_LABEL,
  selectNotificationItems,
  useNotificationStore,
  type NotificationItem,
} from '~/entities/notification'

function NotificationDetail({
  item,
  onBack,
}: {
  item: NotificationItem
  onBack: () => void
}) {
  return (
    <div className="space-y-4">
      <Button type="button" variant="ghost" size="sm" className="-ml-2 h-8 px-2" onClick={onBack}>
        ← 返回列表
      </Button>
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs">
          {NOTIFICATION_TYPE_LABEL[item.type]} · {item.createdAt}
        </p>
        <h3 className="text-base font-medium">{item.title}</h3>
        <p className="text-sm leading-6">{item.content}</p>
      </div>
    </div>
  )
}

function NotificationRow({
  item,
  onSelect,
}: {
  item: NotificationItem
  onSelect: (item: NotificationItem) => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'hover:bg-muted/60 w-full rounded-lg border px-3 py-3 text-left transition-colors',
        !item.read && 'border-primary/30 bg-primary/5',
      )}
      onClick={() => onSelect(item)}
    >
      <div className="mb-1 flex items-center gap-2">
        {!item.read ? <span className="bg-primary size-2 shrink-0 rounded-full" /> : null}
        <span className="text-muted-foreground text-xs">{NOTIFICATION_TYPE_LABEL[item.type]}</span>
        <span className="text-muted-foreground ml-auto text-xs">{item.createdAt}</span>
      </div>
      <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{item.content}</p>
    </button>
  )
}

export function NotificationPanel() {
  const items = useNotificationStore(selectNotificationItems)
  const markReadLocal = useNotificationStore((state) => state.markRead)
  const markAllReadLocal = useNotificationStore((state) => state.markAllRead)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = items.find((item) => item.id === selectedId) ?? null
  const unreadCount = items.filter((item) => !item.read).length

  function handleSelect(item: NotificationItem) {
    markReadLocal(item.id)
    if (isBillingNotificationItemId(item.id)) {
      void billingClient
        .markNotificationRead(parseBillingNotificationItemId(item.id))
        .catch(() => undefined)
    }
    setSelectedId(item.id)
  }

  function handleMarkAllRead() {
    markAllReadLocal()
    void billingClient.markAllNotificationsRead().catch(() => undefined)
  }

  if (selected) {
    return <NotificationDetail item={selected} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm">
          未读消息
          <span className="text-primary ml-1">（{unreadCount} 条）</span>
        </p>
        {unreadCount > 0 ? (
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={handleMarkAllRead}>
            全部已读
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">暂无通知</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <NotificationRow key={item.id} item={item} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  )
}
