import type { AdminPingResponse, AdminSystemFlagsResponse } from '~/shared/api/admin-api'
import type { AdminSystemDependenciesResponse } from '~/entities/admin-platform'
import type { AdminStatusLevel } from '~/shared/ui/admin-status-pill'

export interface SystemHealthSignal {
  id: string
  label: string
  level: AdminStatusLevel
  detail: string
}

export function buildApiPingSignal(
  ping: AdminPingResponse | undefined,
  isError: boolean,
): SystemHealthSignal {
  if (isError || !ping) {
    return {
      id: 'admin-api',
      label: 'Admin API',
      level: 'warn',
      detail: '无法连接 saas-api，请确认服务已启动',
    }
  }

  const online = ping.status === 'ok'
  return {
    id: 'admin-api',
    label: 'Admin API',
    level: online ? 'ok' : 'warn',
    detail: online
      ? `authenticated=${ping.authenticated} · platformAdmin=${ping.platformAdmin}`
      : `status=${ping.status}`,
  }
}

export function buildBillingHealthSignal(
  flags: AdminSystemFlagsResponse,
  billingNode?: AdminSystemDependenciesResponse['nodes'][number],
): SystemHealthSignal {
  if (billingNode) {
    const level: AdminStatusLevel =
      billingNode.status === 'UP'
        ? 'ok'
        : billingNode.status === 'DISABLED'
          ? 'off'
          : 'warn'
    const detail =
      billingNode.status === 'UP'
        ? `探活 UP · ${billingNode.url ?? flags.billing.baseUrl}`
        : billingNode.detail || billingNode.url || billingNode.status
    return {
      id: 'billing',
      label: 'Billing API',
      level,
      detail,
    }
  }

  if (!flags.billing.integrationEnabled) {
    return {
      id: 'billing',
      label: '计费集成',
      level: 'warn',
      detail: 'billing-api 未接入，钱包/充值不可用',
    }
  }

  return {
    id: 'billing',
    label: '计费集成',
    level: 'ok',
    detail: flags.billing.baseUrl,
  }
}

export function dependencyStatusLevel(
  status: AdminSystemDependenciesResponse['nodes'][number]['status'],
): AdminStatusLevel {
  if (status === 'UP') return 'ok'
  if (status === 'DISABLED') return 'off'
  return 'warn'
}

export function buildSystemHealthSignals(
  flags: AdminSystemFlagsResponse,
  ping?: AdminPingResponse,
  pingError = false,
  dependencies?: AdminSystemDependenciesResponse,
): SystemHealthSignal[] {
  const signals: SystemHealthSignal[] = [buildApiPingSignal(ping, pingError)]
  const billingNode = dependencies?.nodes.find((node) => node.id === 'billing-api')

  if (flags.mail.enabled) {
    signals.push({
      id: 'mail',
      label: '邮件出站',
      level: flags.mail.outboundReady ? 'ok' : 'warn',
      detail: flags.mail.outboundReady
        ? `发件 ${flags.mail.fromAddress || '已配置'}`
        : '已启用但未就绪，邀请/验证邮件不可用',
    })
  } else {
    signals.push({
      id: 'mail',
      label: '邮件出站',
      level: 'off',
      detail: '未启用 SMTP，注册验证走 dev 日志',
    })
  }

  signals.push(buildBillingHealthSignal(flags, billingNode))

  signals.push({
    id: 'rls',
    label: '租户 RLS',
    level: flags.tenantRls.enabled ? 'ok' : 'info',
    detail: flags.tenantRls.enabled
      ? 'PostgreSQL 行级隔离已开启'
      : 'RLS 关闭（开发/单租户模式）',
  })

  signals.push({
    id: 'rate-limit',
    label: '全局限流',
    level: flags.rateLimit.enabled ? 'ok' : 'info',
    detail: flags.rateLimit.enabled
      ? `登录 IP 上限 ${flags.rateLimit.loginIpMaxAttempts} 次/窗口`
      : '限流未启用',
  })

  if (flags.mfa.enforcementEnabled && flags.mfa.enrolledPlatformAdminCount === 0) {
    signals.push({
      id: 'admin-mfa',
      label: 'Admin MFA',
      level: 'warn',
      detail: '已开启强制 TOTP，尚无已注册平台管理员（Phase 2 enrollment）',
    })
  } else if (flags.mfa.enforcementEnabled) {
    signals.push({
      id: 'admin-mfa',
      label: 'Admin MFA',
      level: 'ok',
      detail: `强制 TOTP · 已注册 ${flags.mfa.enrolledPlatformAdminCount} 人`,
    })
  } else {
    signals.push({
      id: 'admin-mfa',
      label: 'Admin MFA',
      level: 'info',
      detail: flags.mfa.totpEnrollmentAvailable
        ? 'TOTP 可选，未强制'
        : 'TOTP 注册未开放',
    })
  }

  if (flags.oidc.enabled) {
    signals.push({
      id: 'oidc',
      label: 'OIDC 登录',
      level: flags.oidc.authorizationCodeFlowAvailable ? 'ok' : 'info',
      detail: flags.oidc.authorizationCodeFlowAvailable
        ? `已配置 ${flags.oidc.configuredProviderCount} 个 IdP`
        : `已配置 ${flags.oidc.configuredProviderCount} 个 IdP · 授权码流程待上线`,
    })
  } else {
    signals.push({
      id: 'oidc',
      label: 'OIDC 登录',
      level: 'off',
      detail: '未启用（Email/Password + JWT）',
    })
  }

  return signals
}

export function summarizeSystemHealth(signals: SystemHealthSignal[]) {
  const warnings = signals.filter((s) => s.level === 'warn').length
  const healthy = signals.filter((s) => s.level === 'ok').length
  const overall: AdminStatusLevel =
    warnings > 0 ? 'warn' : healthy === signals.length ? 'ok' : 'info'
  return { overall, warnings, healthy, total: signals.length }
}
