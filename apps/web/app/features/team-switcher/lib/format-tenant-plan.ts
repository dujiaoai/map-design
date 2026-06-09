const PLAN_LABELS: Record<string, string> = {
  free: '免费版',
  pro: '专业版',
  enterprise: '企业版',
}

export function formatTenantPlan(plan: string): string {
  const normalized = plan.trim().toLowerCase()
  return PLAN_LABELS[normalized] ?? plan
}
