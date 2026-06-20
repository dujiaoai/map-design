import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { SaaSRole } from '@repo/auth'
import {
  Button,
  cn,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  toast,
} from '@repo/ui'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangleIcon, ShieldIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  PLATFORM_ADMIN_HINT,
  PLATFORM_ADMIN_LABEL,
} from '~/features/users/lib/user-role-labels'
import { EditUserPreview } from '~/features/users/ui/edit-user-preview'
import { UserOauthBindsPanel } from '~/features/users/ui/user-oauth-binds-panel'
import {
  type AdminUserSummary,
  patchAdminUser,
  resendTenantMemberInvite,
  updateAdminUserRoles,
} from '~/shared/api/admin-api'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  displayName: z.string().min(1, '请输入显示名').max(128),
  status: z.enum(['active', 'disabled']),
  platformAdmin: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const STATUS_OPTIONS = [
  { value: 'active' as const, label: '正常', description: '可登录并使用已授权功能' },
  { value: 'disabled' as const, label: '已禁用', description: '无法登录，可随时恢复' },
]

function buildDefaultValues(user: AdminUserSummary): FormValues {
  return {
    displayName: user.displayName,
    status: user.status === 'disabled' ? 'disabled' : 'active',
    platformAdmin: user.roles.includes(SaaSRole.PLATFORM_ADMIN),
  }
}

export function EditUserSheet({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUserSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantFilterId?: string
}) {
  const queryClient = useQueryClient()
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
  })

  const displayNameValue = watch('displayName')
  const statusValue = watch('status')
  const platformAdminValue = watch('platformAdmin')
  const isInvited = user?.status === 'invited'
  const disabling = user?.status !== 'disabled' && statusValue === 'disabled' && !isInvited

  useEffect(() => {
    if (!user || !open) return
    reset(buildDefaultValues(user))
  }, [user, open, reset])

  const resendInviteMutation = useMutation({
    mutationFn: () => resendTenantMemberInvite(user!.tenantId, user!.id),
    onSuccess: () => {
      toast.success('邀请邮件已重发')
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const invited = user!.status === 'invited'
      const profile = await patchAdminUser(user!.id, {
        displayName: values.displayName.trim(),
        ...(invited ? {} : { status: values.status }),
      })
      const roleCodes = values.platformAdmin ? [SaaSRole.PLATFORM_ADMIN] : []
      const hadPlatformAdmin = user!.roles.includes(SaaSRole.PLATFORM_ADMIN)
      if (values.platformAdmin !== hadPlatformAdmin) {
        return updateAdminUserRoles(user!.id, roleCodes)
      }
      return profile
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onOpenChange(false)
      toast.success('用户已更新')
    },
  })

  function onSubmit(values: FormValues) {
    if (!user) return
    mutation.mutate(values)
  }

  function requestClose() {
    if (mutation.isPending || resendInviteMutation.isPending) return
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
            User Registry
          </p>
          <SheetTitle className="admin-display text-xl">编辑用户</SheetTitle>
          <SheetDescription>
            更新显示名、访问状态与平台权限；租户角色请在成员页管理。
          </SheetDescription>
        </SheetHeader>

        {user ? (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="admin-scroll-area flex-1 space-y-5 px-4 py-5">
              <EditUserPreview
                user={user}
                displayName={displayNameValue}
                status={statusValue}
                platformAdmin={platformAdminValue}
              />

              <section className="space-y-4">
                <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  身份信息
                </h3>
                <AdminField label="邮箱（只读）" htmlFor="edit-user-email">
                  <Input
                    id="edit-user-email"
                    className="font-mono"
                    value={user.email}
                    readOnly
                    disabled
                  />
                </AdminField>
                <AdminField
                  label="显示名"
                  htmlFor="edit-user-name"
                  error={errors.displayName?.message}
                >
                  <Input
                    id="edit-user-name"
                    placeholder="用户在系统内的显示名称"
                    {...register('displayName')}
                  />
                </AdminField>
              </section>

              <section className="space-y-4">
                <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  访问状态
                </h3>
                {isInvited ? (
                  <div className="space-y-3 rounded-lg border border-border/50 bg-background/20 px-3 py-3">
                    <p className="text-sm text-muted-foreground">
                      待激活：邮件邀请尚未完成，暂不可切换为正常/禁用。
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={resendInviteMutation.isPending}
                      onClick={() => void resendInviteMutation.mutateAsync()}
                    >
                      {resendInviteMutation.isPending ? '发送中…' : '重发邀请邮件'}
                    </Button>
                    {resendInviteMutation.isError ? (
                      <AdminFormError message={formatAdminApiError(resendInviteMutation.error)} />
                    ) : null}
                  </div>
                ) : (
                  <>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {STATUS_OPTIONS.map((option) => {
                            const selected = field.value === option.value
                            return (
                              <button
                                key={option.value}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  'admin-create-plan-chip relative z-10 cursor-pointer rounded-xl border px-3 py-3 text-left transition-all',
                                  selected
                                    ? option.value === 'disabled'
                                      ? 'border-destructive/40 bg-destructive/8 ring-1 ring-destructive/25'
                                      : 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
                                    : 'border-border/50 bg-background/20 hover:border-primary/25',
                                )}
                              >
                                <p className="text-sm font-medium">{option.label}</p>
                                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                                  {option.description}
                                </p>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    />
                    {disabling ? (
                      <div
                        className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-xs text-destructive"
                        role="alert"
                      >
                        <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                        <p>禁用后该用户将无法登录，可随时恢复为「正常」。</p>
                      </div>
                    ) : null}
                  </>
                )}
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="size-3.5 text-primary" aria-hidden />
                  <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    平台权限
                  </h3>
                </div>
                <Controller
                  name="platformAdmin"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      aria-pressed={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        'admin-create-plan-chip w-full cursor-pointer rounded-xl border px-3 py-3 text-left transition-all',
                        field.value
                          ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
                          : 'border-border/50 bg-background/20 hover:border-primary/25',
                      )}
                    >
                      <p className="text-sm font-medium">
                        {PLATFORM_ADMIN_LABEL}
                        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                          PLATFORM_ADMIN
                        </span>
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                        {PLATFORM_ADMIN_HINT}
                      </p>
                    </button>
                  )}
                />
              </section>

              <UserOauthBindsPanel userId={user.id} enabled={open} />
              <AdminFormError message={mutation.isError ? formatAdminApiError(mutation.error) : null} />
            </div>

            <SheetFooter className="shrink-0 gap-2 border-t border-border/50 px-4 py-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending || resendInviteMutation.isPending}
                onClick={requestClose}
              >
                取消
              </Button>
              <Button type="submit" disabled={!isDirty || isSubmitting || mutation.isPending}>
                {mutation.isPending ? '保存中…' : '保存更改'}
              </Button>
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
