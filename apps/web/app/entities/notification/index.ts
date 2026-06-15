export type { NotificationItem, NotificationType } from './model/mock-notifications'
export { mockNotifications, NOTIFICATION_TYPE_LABEL } from './model/mock-notifications'
export {
  selectNotificationItems,
  selectUnreadNotificationCount,
  selectUnreadNotificationCountFromStore,
  useNotificationStore,
} from './model/notification-store'
