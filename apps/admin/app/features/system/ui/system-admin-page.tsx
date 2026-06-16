import { useQuery } from '@tanstack/react-query'
import {
  BookOpenIcon,
  CreditCardIcon,
  KeyRoundIcon,
  MailIcon,
  ServerIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
} from 'lucide-react'
import { Link } from 'react-router'

import {
  buildSystemHealthSignals,
  summarizeSystemHealth,
} from '~/features/system/lib/system-health'
import { fetchAdminPing, fetchAdminMfaStatus, fetchAdminSystemFlags } from '~/shared/api/admin-api'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'
import { AdminMetricCard } from '~/shared/ui/admin-metric-card'
import {
  AdminConfigRow,
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminPanelHeader,
} from '~/shared/ui/admin-page-shell'
import { AdminFlagBadge, AdminStatusPill } from '~/shared/ui/admin-status-pill'
import { AdminTableSkeleton } from '~/shared/ui/admin-table-skeleton'

const RUNBOOK_LINKS = [
  {
    label: '本地开发（saas-api）',
    path: 'docs/runbooks/local-dev.md',
    hint: '启动顺序、端口与 seed',
  },
  {
    label: 'Auth 冒烟',
    path: 'docs/runbooks/saas-api-auth-smoke.md',
    hint: '登录 / 刷新 / RBAC',
  },
  {
    label: 'Billing 冒烟',
    path: 'docs/runbooks/billing-api-smoke.md',
    hint: '钱包、充值、调账',
  },
  {
    label: '租户 RLS 说明',
    path: 'docs/architecture/supplements/tenant-rls-b05.md',
    hint: 'PostgreSQL 行级隔离',
  },
] as const

export function SystemAdminPage() {
  const query = useQuery({
    queryKey: adminQueryKeys.systemFlags,
    queryFn: fetchAdminSystemFlags,
  })
  const mfaQuery = useQuery({
    queryKey: adminQueryKeys.mfaStatus,
    queryFn: fetchAdminMfaStatus,
    retry: false,
  })
  const pingQuery = useQuery({
    queryKey: adminQueryKeys.ping,
    queryFn: fetchAdminPing,
    staleTime: 30_000,
  })

  if (query.isLoading) {
    return (
      <div className="space-y-6 admin-stagger">
        <AdminPageHeader
          eyebrow="Platform"
          title="系统"
          description="平台运行配置摘要（只读）；不含密钥与动态改配。"
        />
        <AdminTableSkeleton rows={6} columns={2} />
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <div className="space-y-6 admin-stagger">
        <AdminPageHeader
          eyebrow="Platform"
          title="系统"
          description="平台运行配置摘要（只读）。"
        />
        <AdminPanel>
          <AdminEmptyState
            icon={ServerIcon}
            message="无法加载系统配置，请确认 saas-api 可达且具备 admin:tenants:read。"
            onRetry={() => {
              void query.refetch()
              void pingQuery.refetch()
            }}
            isRetrying={query.isFetching || pingQuery.isFetching}
          />
        </AdminPanel>
      </div>
    )
  }

  const flags = query.data
  const healthSignals = buildSystemHealthSignals(
    flags,
    pingQuery.data,
    pingQuery.isError,
  )
  const healthSummary = summarizeSystemHealth(healthSignals)
  const profileLabel = flags.runtime.activeProfiles.join(', ') || 'default'

  return (
    <div className="space-y-8 admin-stagger">
      <AdminPageHeader
        eyebrow="Platform"
        title="系统"
        description="平台运行配置摘要（只读）；修改请通过部署环境变量或 application.yml。"
        actions={
          <AdminStatusPill
            level={healthSummary.overall}
            label={
              healthSummary.overall === 'ok'
                ? '运行态正常'
                : healthSummary.overall === 'warn'
                  ? `${healthSummary.warnings} 项需关注`
                  : '信息摘要'
            }
          />
        }
      />

      <section className="admin-health-strip admin-stagger px-4 py-4 md:px-5 md:py-5">
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="admin-display text-xs tracking-[0.2em] text-primary/70 uppercase">
              Health
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              关键子系统就绪状态 · Spring profile{' '}
              <span className="font-mono text-xs text-foreground/85">{profileLabel}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {healthSignals.map((signal) => (
              <AdminStatusPill
                key={signal.id}
                level={signal.level}
                label={signal.label}
              />
            ))}
          </div>
        </div>
        <ul className="relative mt-4 grid gap-2 md:grid-cols-2">
          {healthSignals.map((signal) => (
            <li
              key={`${signal.id}-detail`}
              className="rounded-lg border border-border/40 bg-background/25 px-3 py-2 text-xs"
            >
              <span className="font-medium text-foreground/90">{signal.label}</span>
              <span className="mx-1.5 text-muted-foreground">·</span>
              <span className="text-muted-foreground">{signal.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="admin-stagger grid gap-6 lg:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader
            icon={KeyRoundIcon}
            title="注册与认证"
            description="公开注册策略与密码策略"
          />
          <AdminConfigRow
            label="组织自助注册"
            value={
              <AdminFlagBadge enabled={flags.registration.allowPublicOrgSignup} />
            }
          />
          <AdminConfigRow
            label="个人版自助注册"
            value={
              <AdminFlagBadge enabled={flags.registration.allowPublicPersonalSignup} />
            }
          />
          <AdminConfigRow
            label="注册验证 TTL"
            value={flags.registration.registrationTokenTtl}
            mono
          />
          <AdminConfigRow
            label="密码强度校验"
            value={<AdminFlagBadge enabled={flags.auth.passwordStrengthEnabled} />}
          />
          <AdminConfigRow
            label="Admin MFA 强制"
            value={<AdminFlagBadge enabled={flags.mfa.enforcementEnabled} />}
          />
          <AdminConfigRow
            label="TOTP 注册"
            value={
              <AdminFlagBadge
                enabled={flags.mfa.totpEnrollmentAvailable}
                label={
                  flags.mfa.totpEnrollmentAvailable ? '已开放' : '骨架未开放'
                }
              />
            }
          />
          <AdminConfigRow
            label="已注册平台管理员"
            value={String(flags.mfa.enrolledPlatformAdminCount)}
            mono
          />
          {mfaQuery.data ? (
            <AdminConfigRow
              label="当前账号 TOTP"
              value={
                <AdminFlagBadge
                  enabled={mfaQuery.data.enrolled}
                  label={mfaQuery.data.enrolled ? '已绑定' : '未绑定'}
                />
              }
            />
          ) : null}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            icon={MailIcon}
            title="邮件与限流"
            description="出站邮件与登录防护"
          />
          <AdminConfigRow
            label="邮件出站"
            value={<AdminFlagBadge enabled={flags.mail.enabled} />}
          />
          <AdminConfigRow
            label="发件人"
            value={flags.mail.fromAddress || '—'}
            mono
          />
          <AdminConfigRow
            label="邀请/验证可用"
            value={
              <AdminFlagBadge
                enabled={flags.mail.outboundReady}
                label={flags.mail.outboundReady ? '就绪' : '未就绪'}
                warnWhenOff={flags.mail.enabled}
              />
            }
          />
          <AdminConfigRow
            label="全局限流"
            value={<AdminFlagBadge enabled={flags.rateLimit.enabled} />}
          />
          <AdminConfigRow
            label="登录 IP 限流（次/窗口）"
            value={String(flags.rateLimit.loginIpMaxAttempts)}
            mono
          />
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            icon={ShieldIcon}
            title="多租户与计费"
            description="RLS 与 billing-api 集成"
          />
          <AdminConfigRow
            label="PostgreSQL RLS"
            value={<AdminFlagBadge enabled={flags.tenantRls.enabled} />}
          />
          <AdminConfigRow
            label="billing-api 集成"
            value={
              <AdminFlagBadge
                enabled={flags.billing.integrationEnabled}
                warnWhenOff
              />
            }
          />
          <AdminConfigRow label="billing 基址" value={flags.billing.baseUrl} mono />
          <AdminConfigRow
            label="membership push"
            value={<AdminFlagBadge enabled={flags.billing.membershipPushEnabled} />}
          />
          <div className="border-t border-border/50 px-4 py-3 md:px-5">
            <Link
              to="/billing"
              className="admin-quick-link inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm text-primary"
            >
              <CreditCardIcon className="size-3.5" aria-hidden />
              打开计费运营
            </Link>
          </div>
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader
            icon={SlidersHorizontalIcon}
            title="运行态"
            description="JVM 与 JWT 权限世代"
          />
          <AdminConfigRow label="Spring profiles" value={profileLabel} mono />
          <AdminConfigRow
            label="JWT perm_epoch"
            value={String(flags.runtime.jwtPermEpoch)}
            mono
          />
          <div className="grid gap-3 p-4 sm:grid-cols-2 md:p-5">
            <AdminMetricCard
              icon={ServerIcon}
              label="活跃 Profile 数"
              value={flags.runtime.activeProfiles.length}
              hint="来自 spring.profiles.active"
            />
            <AdminMetricCard
              icon={KeyRoundIcon}
              label="权限世代"
              value={flags.runtime.jwtPermEpoch}
              hint="变更后旧 JWT 权限缓存失效"
            />
          </div>
        </AdminPanel>
      </div>

      <AdminPanel className="admin-stagger">
        <AdminPanelHeader
          icon={BookOpenIcon}
          title="Runbook 索引"
          description="仓库内运维文档路径（只读引用，不含密钥）"
        />
        <ul className="divide-y divide-border/50">
          {RUNBOOK_LINKS.map((item) => (
            <li key={item.path} className="admin-runbook-row px-4 py-3.5 md:px-5">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-0.5 font-mono text-xs text-primary/80">{item.path}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  )
}
