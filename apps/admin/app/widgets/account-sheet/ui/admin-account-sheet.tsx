import { useSession } from '@repo/auth'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui'
import { UserCircleIcon } from 'lucide-react'

import { ProfileForm, ResetPasswordForm, OauthBindsPanel } from '~/features/account'
import {
  formatAdminSessionRoles,
  sessionToNavUserData,
} from '~/shared/auth/session-display'
import {
  AdminConfigRow,
  AdminPageEyebrow,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminIdCell } from '~/shared/ui/admin-id-cell'

export function AdminAccountSheet({
  open,
  onOpenChange,
  defaultTab = 'profile',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'profile' | 'password'
}) {
  const session = useSession()
  const navUser = sessionToNavUserData(session)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg">
        <DrawerHeader className="space-y-2 text-left">
          <AdminPageEyebrow>Account</AdminPageEyebrow>
          <DrawerTitle className="admin-display text-xl">账号信息</DrawerTitle>
          <DrawerDescription>查看与维护当前登录账号资料</DrawerDescription>
        </DrawerHeader>

        <div className="admin-stagger flex flex-1 flex-col overflow-y-auto px-4 pb-6">
          <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/10 py-5">
            <Avatar className="size-16 rounded-xl border border-border/60">
              <AvatarImage src={navUser.avatar} alt={navUser.name} className="rounded-xl" />
              <AvatarFallback className="rounded-xl text-lg">{navUser.initials}</AvatarFallback>
            </Avatar>
            <p className="admin-display text-base font-semibold">{navUser.name}</p>
            <p className="text-sm text-muted-foreground">{navUser.email}</p>
          </div>

          {session ? (
            <>
              <AdminPanel className="mb-4">
                <AdminPanelHeader icon={UserCircleIcon} title="会话摘要" />
                <AdminConfigRow
                  label="用户 ID"
                  value={<AdminIdCell value={session.user.id} label="用户 ID" />}
                />
                <AdminConfigRow
                  label="租户 ID"
                  value={
                    session.tenant?.id ? (
                      <AdminIdCell value={session.tenant.id} label="租户 ID" />
                    ) : (
                      '—'
                    )
                  }
                />
                <AdminConfigRow label="邮箱" value={session.user.email} />
                <AdminConfigRow
                  label="角色"
                  value={formatAdminSessionRoles(session.user.roles)}
                />
                <AdminConfigRow
                  label="租户"
                  value={
                    session.tenant
                      ? `${session.tenant.name}${session.tenant.slug ? ` (${session.tenant.slug})` : ''}`
                      : '—'
                  }
                />
              </AdminPanel>

              <OauthBindsPanel />

              <Tabs key={defaultTab} defaultValue={defaultTab} className="gap-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">基本资料</TabsTrigger>
                  <TabsTrigger value="password">修改密码</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <AdminPanel className="p-4 md:p-5">
                    <ProfileForm session={session} />
                  </AdminPanel>
                </TabsContent>

                <TabsContent value="password">
                  <AdminPanel className="p-4 md:p-5">
                    <ResetPasswordForm />
                  </AdminPanel>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
