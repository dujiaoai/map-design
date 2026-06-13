import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui'

import { TenantInviteLinksPanel } from './tenant-invite-links-panel'

export function InviteMemberSheet({
  tenantId,
  open,
  onOpenChange,
}: {
  tenantId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-md">
        <SheetHeader className="shrink-0">
          <SheetTitle className="admin-display text-lg">邀请链接</SheetTitle>
          <SheetDescription>生成可分享邀请链接，新成员通过链接注册加入当前租户。</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          <TenantInviteLinksPanel tenantId={tenantId} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
