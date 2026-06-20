import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui'
import { MailIcon, LinkIcon } from 'lucide-react'

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
  function requestClose() {
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) requestClose()
      }}
    >
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b border-border/50 px-4 pb-4">
          <p className="admin-display text-[10px] tracking-[0.22em] text-primary/75 uppercase">
            Member Onboarding
          </p>
          <SheetTitle className="admin-display text-xl">邀请成员</SheetTitle>
          <SheetDescription>
            通过邮箱邀请或生成可分享链接，新成员加入当前租户。
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <Tabs defaultValue="email" className="flex min-h-0 flex-1 flex-col gap-0">
            <div className="shrink-0 border-b border-border/50 px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">
                  <MailIcon className="size-3.5" />
                  邮箱邀请
                </TabsTrigger>
                <TabsTrigger value="link">
                  <LinkIcon className="size-3.5" />
                  邀请链接
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="email" className="admin-scroll-area mt-0 flex-1 px-4 py-5">
              <TenantEmailInvitePanel tenantId={tenantId} />
            </TabsContent>
            <TabsContent value="link" className="admin-scroll-area mt-0 flex-1 px-4 py-5">
              <TenantInviteLinksPanel tenantId={tenantId} />
            </TabsContent>
          </Tabs>

          <SheetFooter className="shrink-0 gap-2 border-t border-border/50 px-4 py-4 sm:justify-end">
            <Button type="button" variant="outline" onClick={requestClose}>
              关闭
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
