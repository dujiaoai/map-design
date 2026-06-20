import { AUDIT_ACTION_OPTIONS } from '~/features/audit-logs/lib/audit-log-actions'

export type AuditActionCategory =
  | 'tenant'
  | 'member'
  | 'user'
  | 'rbac'
  | 'billing'
  | 'audit'
  | 'impersonation'
  | 'other'

export type AuditActionVerb = 'create' | 'update' | 'delete' | 'other'

const ACTION_LABEL_MAP = Object.fromEntries(
  AUDIT_ACTION_OPTIONS.filter((option) => option.value !== 'all').map((option) => [
    option.value,
    option.label,
  ]),
)

export const AUDIT_ACTION_CATEGORY_LABELS: Record<AuditActionCategory, string> = {
  tenant: '租户',
  member: '成员',
  user: '平台用户',
  rbac: '角色权限',
  billing: '计费',
  audit: '审计',
  impersonation: '代操作',
  other: '其他',
}

export function formatAuditActionLabel(action: string): string {
  return ACTION_LABEL_MAP[action] ?? action
}

export function getAuditActionCategory(action: string): AuditActionCategory {
  if (action.startsWith('impersonation.')) return 'impersonation'
  if (action.startsWith('audit.')) return 'audit'
  if (action.startsWith('billing.')) return 'billing'
  if (
    action.startsWith('tenant_role.') ||
    action.startsWith('role.') ||
    action.startsWith('permission')
  ) {
    return 'rbac'
  }
  if (action.startsWith('member.')) return 'member'
  if (action.startsWith('user.')) return 'user'
  if (action.startsWith('tenant.')) return 'tenant'
  return 'other'
}

export function getAuditActionVerb(action: string): AuditActionVerb {
  if (
    action.includes('.create') ||
    action.includes('.invite') ||
    action.endsWith('.start') ||
    action.includes('.approve')
  ) {
    return 'create'
  }
  if (
    action.includes('.delete') ||
    action.includes('.revoke') ||
    action.endsWith('.stop') ||
    action.includes('.reject')
  ) {
    return 'delete'
  }
  if (
    action.includes('.update') ||
    action.includes('.adjust') ||
    action.includes('.write') ||
    action.includes('.issue') ||
    action.includes('.resend') ||
    action.includes('.export')
  ) {
    return 'update'
  }
  return 'other'
}

export function auditActorInitials(email: string): string {
  const local = email.split('@')[0]?.trim() ?? ''
  if (local.length >= 2) return local.slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

export function formatAuditDetailContent(detail: string | null): {
  text: string
  isJson: boolean
  empty: boolean
} {
  if (!detail?.trim()) {
    return { text: '—', isJson: false, empty: true }
  }

  try {
    const parsed = JSON.parse(detail) as unknown
    return {
      text: JSON.stringify(parsed, null, 2),
      isJson: true,
      empty: false,
    }
  } catch {
    return { text: detail, isJson: false, empty: false }
  }
}

export function describeAuditAction(action: string): string {
  const category = AUDIT_ACTION_CATEGORY_LABELS[getAuditActionCategory(action)]
  const label = formatAuditActionLabel(action)
  return `${category} · ${label}`
}
