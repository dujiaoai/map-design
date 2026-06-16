import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui'

import { TenantEmailInvitePanel } from './tenant-email-invite-panel'
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
          <SheetTitle className="admin-display text-lg">邀请成员</SheetTitle>
          <SheetDescription>邮箱邀请或生成可分享链接，新成员加入当前租户。</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
          <Tabs defaultValue="email" className="flex min-h-0 flex-1 flex-col gap-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">邮箱邀请</TabsTrigger>
              <TabsTrigger value="link">邀请链接</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="mt-0 flex-1">
              <TenantEmailInvitePanel tenantId={tenantId} />
            </TabsContent>
            <TabsContent value="link" className="mt-0 flex-1">
              <TenantInviteLinksPanel tenantId={tenantId} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
