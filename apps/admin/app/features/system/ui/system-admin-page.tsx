import { Badge } from '@repo/ui'
import { useQuery } from '@tanstack/react-query'
import { ExternalLinkIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { fetchAdminSystemFlags } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '~/shared/ui/admin-page-shell'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

const RUNBOOK_LINKS = [
  {
    label: '本地开发（saas-api）',
    path: 'docs/runbooks/local-dev.md',
  },
  {
    label: 'Auth 冒烟',
    path: 'docs/runbooks/saas-api-auth-smoke.md',
  },
  {
    label: 'Billing 冒烟',
    path: 'docs/runbooks/billing-api-smoke.md',
  },
  {
    label: '租户 RLS 说明',
    path: 'docs/architecture/supplements/tenant-rls-b05.md',
  },
] as const

function FlagBadge({ enabled, label }: { enabled: boolean; label?: string }) {
  return (
    <Badge variant={enabled ? 'default' : 'secondary'}>
      {label ?? (enabled ? '已启用' : '已关闭')}
    </Badge>
  )
}

function FlagRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-4 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function SystemAdminPage() {
  const query = useQuery({
    queryKey: adminQueryKeys.systemFlags,
    queryFn: fetchAdminSystemFlags,
  })

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="系统"
          description="平台运行配置摘要（只读）；不含密钥与动态改配。"
        />
        <AdminTableSkeleton rows={6} columns={2} />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="系统" description="平台运行配置摘要（只读）。" />
        <AdminEmptyState message="无法加载系统配置，请确认 saas-api 可达且具备 admin:tenants:read。" />
      </div>
    )
  }

  const flags = query.data

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="系统"
        description="平台运行配置摘要（只读）；修改请通过部署环境变量或 application.yml。"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel>
          <header className="border-b border-border/50 px-4 py-3">
            <h3 className="text-sm font-semibold">注册与认证</h3>
          </header>
          <FlagRow
            label="组织自助注册"
            value={<FlagBadge enabled={flags.registration.allowPublicOrgSignup} />}
          />
          <FlagRow
            label="个人版自助注册"
            value={<FlagBadge enabled={flags.registration.allowPublicPersonalSignup} />}
          />
          <FlagRow label="注册验证 TTL" value={flags.registration.registrationTokenTtl} />
          <FlagRow
            label="密码强度校验"
            value={<FlagBadge enabled={flags.auth.passwordStrengthEnabled} />}
          />
        </AdminPanel>

        <AdminPanel>
          <header className="border-b border-border/50 px-4 py-3">
            <h3 className="text-sm font-semibold">邮件与限流</h3>
          </header>
          <FlagRow label="邮件出站" value={<FlagBadge enabled={flags.mail.enabled} />} />
          <FlagRow label="发件人" value={flags.mail.fromAddress || '—'} />
          <FlagRow
            label="邀请/验证可用"
            value={<FlagBadge enabled={flags.mail.outboundReady} label={flags.mail.outboundReady ? '就绪' : '未就绪'} />}
          />
          <FlagRow label="全局限流" value={<FlagBadge enabled={flags.rateLimit.enabled} />} />
          <FlagRow
            label="登录 IP 限流（次/窗口）"
            value={String(flags.rateLimit.loginIpMaxAttempts)}
          />
        </AdminPanel>

        <AdminPanel>
          <header className="border-b border-border/50 px-4 py-3">
            <h3 className="text-sm font-semibold">多租户与计费</h3>
          </header>
          <FlagRow
            label="PostgreSQL RLS"
            value={<FlagBadge enabled={flags.tenantRls.enabled} />}
          />
          <FlagRow
            label="billing-api 集成"
            value={<FlagBadge enabled={flags.billing.integrationEnabled} />}
          />
          <FlagRow label="billing 基址" value={flags.billing.baseUrl} />
          <FlagRow
            label="membership push"
            value={<FlagBadge enabled={flags.billing.membershipPushEnabled} />}
          />
          <div className="px-4 py-3">
            <Link
              to="/billing"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              打开计费运营
              <ExternalLinkIcon className="size-3.5" aria-hidden />
            </Link>
          </div>
        </AdminPanel>

        <AdminPanel>
          <header className="border-b border-border/50 px-4 py-3">
            <h3 className="text-sm font-semibold">运行态与文档</h3>
          </header>
          <FlagRow label="Spring profiles" value={flags.runtime.activeProfiles.join(', ')} />
          <FlagRow label="JWT perm_epoch" value={String(flags.runtime.jwtPermEpoch)} />
          <ul className="divide-y divide-border/50">
            {RUNBOOK_LINKS.map((item) => (
              <li key={item.path} className="px-4 py-3">
                <span className="text-sm font-medium">{item.label}</span>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{item.path}</p>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>
    </div>
  )
}
