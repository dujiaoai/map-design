import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@repo/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  createTenantInviteLink,
  revokeTenantInviteLink,
  fetchAssignableRoles,
  fetchTenantInviteLinks,
} from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { formatAdminApiError } from '~/shared/lib/format-admin-api-error'
import { AdminEmptyState } from '~/shared/ui/admin-page-shell'
import { AdminField, AdminFormError } from '~/shared/ui/admin-field'
import { AdminSidebarListSkeleton } from '~/shared/ui/admin-table-skeleton'
import { formatAdminDate } from '~/shared/ui/admin-status-badge'

import {
  formatInviteLinkExpiry,
  formatInviteLinkUses,
  formatMemberRoleLabel,
  INVITE_LINK_STATUS_LABELS,
} from '../lib/member-role-labels'

type CreateLinkFormValues = {
  roleCode: string
  label?: string
  maxUses?: number | ''
  expiresInHours?: number | ''
}

export function TenantInviteLinksPanel({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient()
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null)

  const linksQuery = useQuery({
    queryKey: adminQueryKeys.inviteLinks(tenantId),
    queryFn: () => fetchTenantInviteLinks(tenantId),
  })

  const assignableRolesQuery = useQuery({
    queryKey: adminQueryKeys.assignableRoles(tenantId),
    queryFn: () => fetchAssignableRoles(tenantId),
  })

  const roleLabels = useMemo(() => {
    const map = new Map<string, string>()
    for (const role of assignableRolesQuery.data?.roles ?? []) {
      map.set(role.code, role.name)
    }
    return map
  }, [assignableRolesQuery.data?.roles])

  const defaultRoleCode = assignableRolesQuery.data?.roles[0]?.code ?? 'MEMBER'

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<CreateLinkFormValues>({
    defaultValues: {
      roleCode: 'MEMBER',
      label: '',
      maxUses: '',
      expiresInHours: '',
    },
  })

  const roleCode = watch('roleCode')

  useEffect(() => {
    const roles = assignableRolesQuery.data?.roles ?? []
    if (!roles.length) return
    if (!roles.some((role) => role.code === roleCode)) {
      setValue('roleCode', roles[0]!.code)
    }
  }, [assignableRolesQuery.data?.roles, roleCode, setValue])

  const createMutation = useMutation({
    mutationFn: (values: CreateLinkFormValues) =>
      createTenantInviteLink(tenantId, {
        roleCode: values.roleCode,
        label: values.label?.trim() || undefined,
        maxUses: values.maxUses === '' ? undefined : Number(values.maxUses),
        expiresInHours: values.expiresInHours === '' ? undefined : Number(values.expiresInHours),
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.inviteLinks(tenantId) })
      setCreatedInviteUrl(data.inviteUrl)
      reset({ roleCode: defaultRoleCode, label: '', maxUses: '', expiresInHours: '' })
      toast.success('邀请链接已创建', { description: '请立即复制链接，token 仅显示一次。' })
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (linkId: string) => revokeTenantInviteLink(tenantId, linkId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.inviteLinks(tenantId) })
      toast.success('邀请链接已撤销')
    },
  })

  async function copyInviteUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('已复制到剪贴板')
    } catch {
      toast.error('复制失败，请手动选中链接复制')
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="shrink-0 text-sm text-muted-foreground">
        生成可分享链接，任何人持链接均可注册加入本租户。链接 token 仅在创建时显示一次，请立即复制保存。
      </p>

      <form
        className="grid shrink-0 gap-3 rounded-lg border border-border/60 p-3"
        onSubmit={handleSubmit((values) => createMutation.mutate(values))}
      >
        <p className="text-sm font-medium">创建新链接</p>
        <AdminField label="默认角色">
          <Select
            value={roleCode}
            onValueChange={(value) => setValue('roleCode', value ?? defaultRoleCode)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择角色" />
            </SelectTrigger>
            <SelectContent>
              {(assignableRolesQuery.data?.roles ?? []).map((role) => (
                <SelectItem key={role.id} value={role.code}>
                  {role.name}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">{role.code}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminField>
        <AdminField label="备注" htmlFor="invite-link-label">
          <Input id="invite-link-label" placeholder="例如：Q2 项目组" {...register('label')} />
        </AdminField>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="最大使用次数" htmlFor="invite-link-max-uses">
            <Input
              id="invite-link-max-uses"
              inputMode="numeric"
              placeholder="留空表示不限"
              {...register('maxUses')}
            />
          </AdminField>
          <AdminField label="有效小时数" htmlFor="invite-link-expires">
            <Input
              id="invite-link-expires"
              inputMode="numeric"
              placeholder="默认 7 天"
              {...register('expiresInHours')}
            />
          </AdminField>
        </div>
        <AdminFormError message={createMutation.isError ? formatAdminApiError(createMutation.error) : null} />
        <Button type="submit" disabled={isSubmitting || createMutation.isPending} className="w-fit">
          {createMutation.isPending ? '生成中…' : '生成邀请链接'}
        </Button>
      </form>

      {createdInviteUrl ? (
        <div className="shrink-0 space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="text-sm font-medium text-primary">链接已生成，请立即复制</p>
          <p className="break-all font-mono text-xs text-muted-foreground">{createdInviteUrl}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" onClick={() => void copyInviteUrl(createdInviteUrl)}>
              复制链接
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setCreatedInviteUrl(null)}>
              关闭
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <p className="shrink-0 text-sm font-medium">已有链接</p>
        <div className="admin-scroll-area -mr-1 min-h-0 flex-1 pr-1">
          {linksQuery.isLoading ? (
            <AdminSidebarListSkeleton rows={3} />
          ) : linksQuery.isError ? (
            <AdminEmptyState
              message="加载邀请链接失败，请刷新重试"
              onRetry={() => void linksQuery.refetch()}
              isRetrying={linksQuery.isFetching}
            />
          ) : !linksQuery.data?.links.length ? (
            <p className="text-sm text-muted-foreground">暂无邀请链接</p>
          ) : (
            <ul className="space-y-2">
              {linksQuery.data.links.map((link) => (
                <li
                  key={link.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {formatMemberRoleLabel(link.roleCode, roleLabels.get(link.roleCode))}
                    </Badge>
                    <Badge
                      variant={link.status === 'active' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {INVITE_LINK_STATUS_LABELS[link.status]}
                    </Badge>
                    {link.label ? (
                      <span className="text-muted-foreground">{link.label}</span>
                    ) : null}
                  </div>
                  <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <span>使用：{formatInviteLinkUses(link.useCount, link.maxUses)}</span>
                    <span>过期：{formatInviteLinkExpiry(link.expiresAt)}</span>
                    <span>创建：{formatAdminDate(link.createdAt)}</span>
                  </div>
                  {link.status === 'active' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-fit"
                      disabled={revokeMutation.isPending}
                      onClick={() => revokeMutation.mutate(link.id)}
                    >
                      撤销链接
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        <AdminFormError message={revokeMutation.isError ? formatAdminApiError(revokeMutation.error) : null} />
      </div>
    </div>
  )
}
