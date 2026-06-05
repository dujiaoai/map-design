export type NotificationType = 'system' | 'task' | 'alert'

export interface NotificationItem {
  id: string
  title: string
  content: string
  type: NotificationType
  read: boolean
  createdAt: string
}

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  system: '系统消息',
  task: '任务提醒',
  alert: '告警通知',
}

/** Mock 数据：yunyan-web 侧栏通知暂无独立 profile 接口，后续可替换为真实 API */
export const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: '直播开始前提醒',
    content: '您预约的「惠城区巡查直播」将于 15 分钟后开始，请提前进入观看。',
    type: 'task',
    read: false,
    createdAt: '2026-05-31 14:30:00',
  },
  {
    id: '2',
    title: '订单取消提醒',
    content: '任务订单 #20260531001 已被取消，请留意后续调度安排。',
    type: 'alert',
    read: false,
    createdAt: '2026-05-31 11:20:00',
  },
  {
    id: '3',
    title: '系统维护通知',
    content: '平台将于 6 月 1 日 02:00–04:00 进行例行维护，期间部分功能可能不可用。',
    type: 'system',
    read: false,
    createdAt: '2026-05-30 18:00:00',
  },
  {
    id: '4',
    title: '内部消息已读回执',
    content: '您有一条来自运维中心的内部消息，请及时查看并确认。',
    type: 'system',
    read: true,
    createdAt: '2026-05-29 09:15:00',
  },
  {
    id: '5',
    title: '巡检任务完成',
    content: '「仲恺高新区」巡检航线已执行完毕，可在任务历史中查看成果。',
    type: 'task',
    read: true,
    createdAt: '2026-05-28 16:45:00',
  },
]
