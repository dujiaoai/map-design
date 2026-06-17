export interface AdminRunbookLink {
  id: string
  label: string
  /** 仓库内相对路径（docs/runbooks/...） */
  path: string
  hint: string
  /** Admin 内相关页面快捷入口 */
  inAppTo?: string
}

export const ADMIN_RUNBOOK_LINKS: AdminRunbookLink[] = [
  {
    id: 'local-dev',
    label: '本地开发（saas-api）',
    path: 'docs/runbooks/local-dev.md',
    hint: '启动顺序、端口与 seed',
    inAppTo: '/system',
  },
  {
    id: 'auth-smoke',
    label: 'Auth 冒烟',
    path: 'docs/runbooks/saas-api-auth-smoke.md',
    hint: '登录 / 刷新 / RBAC',
  },
  {
    id: 'billing-smoke',
    label: 'Billing 冒烟',
    path: 'docs/runbooks/billing-api-smoke.md',
    hint: '钱包、充值、调账',
    inAppTo: '/billing',
  },
  {
    id: 'billing-reconciliation',
    label: '计费对账告警',
    path: 'docs/runbooks/billing-reconciliation-alert.md',
    hint: '日对账 Job、ops alert 关闭流程',
    inAppTo: '/billing?tab=reconciliation',
  },
  {
    id: 'docker-deploy',
    label: 'Docker 全栈部署',
    path: 'docs/runbooks/docker-deployment.md',
    hint: 'compose、nginx、smoke',
  },
  {
    id: 'oidc-dev',
    label: 'OIDC 本地联调',
    path: 'docs/runbooks/oidc-dev-setup.md',
    hint: 'Keycloak、redirect URI、探活',
    inAppTo: '/login',
  },
  {
    id: 'tenant-rls',
    label: '租户 RLS 说明',
    path: 'docs/architecture/supplements/tenant-rls-b05.md',
    hint: 'PostgreSQL 行级隔离',
  },
]

/** 可选：VITE_DOCS_REPO_BROWSE_URL=https://github.com/org/map-design/blob/main */
export function resolveRunbookDocsHref(repoPath: string): string | null {
  const base = import.meta.env.VITE_DOCS_REPO_BROWSE_URL as string | undefined
  if (!base?.trim()) return null
  return `${base.replace(/\/$/, '')}/${repoPath.replace(/^\//, '')}`
}
