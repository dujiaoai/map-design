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

import { ProfileForm, ResetPasswordForm } from '~/features/account'
import {
  formatAdminSessionRoles,
  sessionToNavUserData,
} from '~/shared/auth/session-display'

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 text-sm last:border-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium break-all">{value || '-'}</span>
    </div>
  )
}

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
        <DrawerHeader>
          <DrawerTitle>账号信息</DrawerTitle>
          <DrawerDescription>查看与维护当前登录账号资料</DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-6">
          <div className="mb-4 flex flex-col items-center gap-2 py-2">
            <Avatar className="size-16 rounded-lg">
              <AvatarImage src={navUser.avatar} alt={navUser.name} className="rounded-lg" />
              <AvatarFallback className="rounded-lg text-lg">{navUser.initials}</AvatarFallback>
            </Avatar>
            <p className="text-base font-medium">{navUser.name}</p>
            <p className="text-muted-foreground text-sm">{navUser.email}</p>
          </div>

          {session ? (
            <>
              <div className="mb-4 rounded-lg border px-4">
                <ProfileField label="用户 ID" value={session.user.id} />
                <ProfileField label="邮箱" value={session.user.email} />
                <ProfileField label="角色" value={formatAdminSessionRoles(session.user.roles)} />
                <ProfileField
                  label="租户"
                  value={
                    session.tenant
                      ? `${session.tenant.name}${session.tenant.slug ? ` (${session.tenant.slug})` : ''}`
                      : '-'
                  }
                />
              </div>

              <Tabs key={defaultTab} defaultValue={defaultTab} className="gap-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">基本资料</TabsTrigger>
                  <TabsTrigger value="password">修改密码</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="rounded-lg border p-4">
                  <ProfileForm session={session} />
                </TabsContent>

                <TabsContent value="password" className="rounded-lg border p-4">
                  <ResetPasswordForm />
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
