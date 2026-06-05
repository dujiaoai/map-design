import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@repo/ui'

import { NotificationPanel } from '~/features/notifications'

export function NotificationSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>通知</DrawerTitle>
          <DrawerDescription>查看系统与任务相关消息（当前为 Mock 数据）</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <NotificationPanel />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
