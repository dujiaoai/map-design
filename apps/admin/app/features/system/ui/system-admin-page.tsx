import { useQuery } from '@tanstack/react-query'
import {
  ArrowRightIcon,
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
  dependencyStatusLevel,
  summarizeSystemHealth,
} from '~/features/system/lib/system-health'
import { AdminMfaEnrollPanel } from '~/features/mfa/ui/admin-mfa-enroll-panel'
import { AdminRunbookLinksPanel } from '~/features/system/ui/admin-runbook-links-panel'
import {
  fetchAdminPing,
  fetchAdminMfaStatus,
  fetchAdminSystemDependencies,
  fetchAdminSystemFlags,
} from '~/shared/api/admin-api'
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
  const dependenciesQuery = useQuery({
    queryKey: adminQueryKeys.systemDependencies,
    queryFn: fetchAdminSystemDependencies,
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
              void dependenciesQuery.refetch()
            }}
            isRetrying={query.isFetching || pingQuery.isFetching || dependenciesQuery.isFetching}
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
    dependenciesQuery.data,
  )
  const healthSummary = summarizeSystemHealth(healthSignals)
  const dependencyNodes = dependenciesQuery.data?.nodes ?? []
  const dependencyEdges = dependenciesQuery.data?.edges ?? []
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

      {dependencyNodes.length > 0 ? (
        <section className="admin-stagger rounded-xl border border-border/50 bg-card/40 px-4 py-4 md:px-5 md:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="admin-display text-xs tracking-[0.2em] text-primary/70 uppercase">
                Dependencies
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                saas-api 对下游服务的实时探活（FND-05 HealthIndicator）
              </p>
            </div>
            {dependenciesQuery.isFetching ? (
              <span className="text-xs text-muted-foreground">刷新探活…</span>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {dependencyNodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-3">
                <div className="rounded-lg border border-border/60 bg-background/40 px-4 py-3 min-w-[10rem]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{node.label}</p>
                    <AdminStatusPill
                      level={dependencyStatusLevel(node.status)}
                      label={node.status}
                    />
                  </div>
                  {node.url ? (
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">{node.url}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">{node.detail}</p>
                </div>
                {index < dependencyNodes.length - 1 ? (
                  <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                ) : null}
              </div>
            ))}
          </div>
          {dependencyEdges.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              {dependencyEdges.map((edge) => (
                <li key={`${edge.from}-${edge.to}`} className="font-mono">
                  {edge.from} → {edge.to} · {edge.kind}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

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
                  flags.mfa.totpEnrollmentAvailable ? '已开放' : '未开放'
                }
              />
            }
          />
          <AdminConfigRow
            label="已注册平台管理员"
            value={String(flags.mfa.enrolledPlatformAdminCount)}
            mono
          />
          <AdminConfigRow
            label="OIDC 登录"
            value={<AdminFlagBadge enabled={flags.oidc.enabled} />}
          />
          <AdminConfigRow
            label="OIDC 已配置 IdP"
            value={String(flags.oidc.configuredProviderCount)}
            mono
          />
          <AdminConfigRow
            label="OIDC 授权码流程"
            value={
              <AdminFlagBadge
                enabled={flags.oidc.authorizationCodeFlowAvailable}
                label={
                  flags.oidc.authorizationCodeFlowAvailable ? '已开放' : '骨架期未开放'
                }
              />
            }
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

        {flags.mfa.totpEnrollmentAvailable && mfaQuery.data ? (
          <AdminMfaEnrollPanel
            enrolled={mfaQuery.data.enrolled}
            recoveryCodesRemaining={mfaQuery.data.recoveryCodesRemaining ?? 0}
          />
        ) : null}

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

      <AdminRunbookLinksPanel />
    </div>
  )
}
