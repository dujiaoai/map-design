import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangleIcon, ShieldIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { describeMemberRole } from '~/features/members/lib/member-role-labels'
import { EditMemberPreview } from '~/features/members/ui/edit-member-preview'
import {
  fetchAssignableRoles,
  patchTenantMember,
  resendTenantMemberInvite,
  updateTenantMemberRoles,
  type AdminUserSummary,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'

const schema = z.object({
  displayName: z.string().min(1, '请输入显示名').max(128),
  status: z.enum(['active', 'disabled']),
  roleCode: z.string().min(1, '请选择角色'),
})

type FormValues = z.infer<typeof schema>

const STATUS_OPTIONS = [
  { value: 'active' as const, label: '正常', description: '可登录并使用租户功能' },
  { value: 'disabled' as const, label: '已禁用', description: '无法登录，可随时恢复' },
]

function buildDefaultValues(
  member: AdminUserSummary,
  roles: { code: string; name: string }[],
): FormValues {
  const primaryRole =
    member.roles.find((role) => roles.some((item) => item.code === role)) ??
    roles[0]?.code ??
    'MEMBER'
  return {
    displayName: member.displayName,
    status: member.status === 'disabled' ? 'disabled' : 'active',
    roleCode: primaryRole,
  }
}

export function EditMemberSheet({
  tenantId,
  member,
  open,
  onOpenChange,
}: {
  tenantId: string
  member: AdminUserSummary | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const assignableRolesQuery = useQuery({
    queryKey: adminQueryKeys.assignableRoles(tenantId),
    queryFn: () => fetchAssignableRoles(tenantId),
    enabled: open,
  })

  const roles = assignableRolesQuery.data?.roles ?? []

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
  const roleCodeValue = watch('roleCode')
  const isInvited = member?.status === 'invited'
  const disabling = member?.status !== 'disabled' && statusValue === 'disabled' && !isInvited

  useEffect(() => {
    if (!member || !open) return
    reset(buildDefaultValues(member, roles))
  }, [member, open, reset, roles])

  const resendInviteMutation = useMutation({
    mutationFn: () => resendTenantMemberInvite(tenantId, member!.id),
    onSuccess: async () => {
      toast.success('邀请邮件已重发')
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const invited = member!.status === 'invited'
      const profilePatch = {
        displayName: values.displayName.trim(),
        ...(invited ? {} : { status: values.status }),
      }
      await patchTenantMember(tenantId, member!.id, profilePatch)
      return updateTenantMemberRoles(tenantId, member!.id, [values.roleCode])
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.membersRoot(tenantId) })
      onOpenChange(false)
      toast.success('成员已更新')
    },
  })

  function onSubmit(values: FormValues) {
    if (!member) return
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
            Member Registry
          </p>
          <SheetTitle className="admin-display text-xl">编辑成员</SheetTitle>
          <SheetDescription>
            更新显示名、角色与访问状态；邮箱不可修改。
          </SheetDescription>
        </SheetHeader>

        {member ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="admin-scroll-area flex-1 space-y-5 px-4 py-5">
              <EditMemberPreview
                member={member}
                displayName={displayNameValue}
                roleCode={roleCodeValue}
                status={statusValue}
                roles={roles}
              />

              <section className="space-y-4">
                <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  身份信息
                </h3>
                <AdminField label="邮箱（只读）" htmlFor="edit-member-email">
                  <Input
                    id="edit-member-email"
                    className="font-mono"
                    value={member.email}
                    readOnly
                    disabled
                  />
                </AdminField>
                <AdminField
                  label="显示名"
                  htmlFor="edit-member-name"
                  error={errors.displayName?.message}
                >
                  <Input
                    id="edit-member-name"
                    placeholder="成员在租户内的显示名称"
                    {...register('displayName')}
                  />
                </AdminField>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="size-3.5 text-primary" aria-hidden />
                  <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    角色分配
                  </h3>
                </div>
                <Controller
                  name="roleCode"
                  control={control}
                  render={({ field }) => (
                    <div className="grid gap-2">
                      {roles.map((role) => {
                        const selected = field.value === role.code
                        return (
                          <button
                            key={role.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => field.onChange(role.code)}
                            className={cn(
                              'admin-create-plan-chip relative z-10 cursor-pointer rounded-xl border px-3 py-3 text-left transition-all',
                              selected
                                ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
                                : 'border-border/50 bg-background/20 hover:border-primary/25',
                            )}
                          >
                            <p className="text-sm font-medium">
                              {role.name}
                              <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                                {role.code}
                              </span>
                            </p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                              {describeMemberRole(role)}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
                {errors.roleCode?.message ? (
                  <p className="text-xs text-destructive">{errors.roleCode.message}</p>
                ) : null}
              </section>

              <section className="space-y-4">
                <h3 className="admin-display text-xs tracking-[0.18em] text-muted-foreground uppercase">
                  访问状态
                </h3>
                {isInvited ? (
                  <div className="space-y-3 rounded-lg border border-border/50 bg-background/20 px-3 py-3">
                    <p className="text-sm text-muted-foreground">
                      待激活：邮件邀请或链接注册尚未完成，暂不可切换为正常/禁用。
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
                        <p>禁用后该成员将无法登录本租户，可随时恢复为「正常」。</p>
                      </div>
                    ) : null}
                  </>
                )}
              </section>

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
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting || mutation.isPending}
              >
                {mutation.isPending ? '保存中…' : '保存更改'}
              </Button>
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
