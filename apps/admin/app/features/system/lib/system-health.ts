import type { AdminPingResponse, AdminSystemFlagsResponse } from '~/shared/api/admin-api'
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

export function buildSystemHealthSignals(
  flags: AdminSystemFlagsResponse,
  ping?: AdminPingResponse,
  pingError = false,
): SystemHealthSignal[] {
  const signals: SystemHealthSignal[] = [buildApiPingSignal(ping, pingError)]

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

  signals.push({
    id: 'billing',
    label: '计费集成',
    level: flags.billing.integrationEnabled ? 'ok' : 'warn',
    detail: flags.billing.integrationEnabled
      ? flags.billing.baseUrl
      : 'billing-api 未接入，钱包/充值不可用',
  })

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

  return signals
}

export function summarizeSystemHealth(signals: SystemHealthSignal[]) {
  const warnings = signals.filter((s) => s.level === 'warn').length
  const healthy = signals.filter((s) => s.level === 'ok').length
  const overall: AdminStatusLevel =
    warnings > 0 ? 'warn' : healthy === signals.length ? 'ok' : 'info'
  return { overall, warnings, healthy, total: signals.length }
}
