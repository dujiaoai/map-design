import {
  trialDateToEpochMs,
  trialEpochMsToDate,
} from '~/features/tenants/lib/tenant-lifecycle'

import type { PatchTenantPayload } from '~/entities/tenant'

export const TENANT_PLAN_OPTIONS = [
  {
    value: 'free',
    label: 'Free',
    description: '基础能力，适合评估与小型团队',
  },
  {
    value: 'trial',
    label: 'Trial',
    description: '试用计划，配合试用截止日使用',
  },
  {
    value: 'starter',
    label: 'Starter',
    description: '标准席位与 API 配额',
  },
  {
    value: 'pro',
    label: 'Pro',
    description: '更高配额与优先支持',
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: '定制合约与企业集成',
  },
] as const

export type TenantPlanValue = (typeof TENANT_PLAN_OPTIONS)[number]['value']

export type TenantTrialPreset = 'none' | '14d' | '30d' | 'custom'

export const TENANT_TRIAL_PRESETS: {
  value: TenantTrialPreset
  label: string
  hint: string
}[] = [
  { value: 'none', label: '无试用', hint: '正式租户，不设截止日' },
  { value: '14d', label: '14 天', hint: '从今天起 14 日试用' },
  { value: '30d', label: '30 天', hint: '从今天起 30 日试用' },
  { value: 'custom', label: '自定义', hint: '指定试用截止日' },
]

export function addDaysToDateString(days: number, from = new Date()): string {
  const date = new Date(from)
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function resolveCreateTrialEndsAt(
  preset: TenantTrialPreset,
  customDate: string,
): number | undefined {
  if (preset === 'none') return undefined
  if (preset === '14d') {
    const ms = trialDateToEpochMs(addDaysToDateString(14))
    return ms ?? undefined
  }
  if (preset === '30d') {
    const ms = trialDateToEpochMs(addDaysToDateString(30))
    return ms ?? undefined
  }
  if (!customDate.trim()) return undefined
  const ms = trialDateToEpochMs(customDate.trim())
  return ms ?? undefined
}

export function describeTrialPreset(
  preset: TenantTrialPreset,
  customDate: string,
): string {
  if (preset === 'none') return '正式租户'
  if (preset === '14d') return `试用至 ${addDaysToDateString(14)}`
  if (preset === '30d') return `试用至 ${addDaysToDateString(30)}`
  if (!customDate.trim()) return '请选择试用截止日'
  return `试用至 ${customDate}`
}

export function applyTrialPreset(
  preset: TenantTrialPreset,
  setValue: (
    name: 'trialEndsAtDate' | 'plan',
    value: string,
    options?: { shouldDirty?: boolean; shouldValidate?: boolean },
  ) => void,
  currentPlan: string,
) {
  if (preset === '14d') {
    setValue('trialEndsAtDate', addDaysToDateString(14), { shouldDirty: true, shouldValidate: true })
    if (currentPlan === 'free') {
      setValue('plan', 'trial', { shouldDirty: true, shouldValidate: true })
    }
    return
  }
  if (preset === '30d') {
    setValue('trialEndsAtDate', addDaysToDateString(30), { shouldDirty: true, shouldValidate: true })
    if (currentPlan === 'free') {
      setValue('plan', 'trial', { shouldDirty: true, shouldValidate: true })
    }
    return
  }
  if (preset === 'none') {
    setValue('trialEndsAtDate', '', { shouldDirty: true, shouldValidate: true })
  }
}

export function inferTrialPresetFromEndsAt(trialEndsAt: number | null | undefined): {
  preset: TenantTrialPreset
  customDate: string
} {
  if (trialEndsAt == null) {
    return { preset: 'none', customDate: '' }
  }
  return { preset: 'custom', customDate: trialEpochMsToDate(trialEndsAt) }
}

export function resolveEditTrialPatch(
  preset: TenantTrialPreset,
  customDate: string,
): Pick<PatchTenantPayload, 'trialEndsAt' | 'clearTrialEndsAt'> {
  if (preset === 'none') {
    return { clearTrialEndsAt: true }
  }
  const trialEndsAt = resolveCreateTrialEndsAt(preset, customDate)
  if (trialEndsAt == null) return {}
  return { trialEndsAt }
}

export function planOptionsForTenant(currentPlan: string) {
  const normalized = currentPlan.trim().toLowerCase()
  if (!normalized || TENANT_PLAN_OPTIONS.some((option) => option.value === normalized)) {
    return TENANT_PLAN_OPTIONS
  }
  return [
    {
      value: currentPlan,
      label: `${currentPlan}（当前）`,
      description: '未在标准目录中的计划，可改选下方标准项',
    },
    ...TENANT_PLAN_OPTIONS,
  ]
}

export function formatTenantPlanLabel(plan: string): string {
  const meta = planOptionsForTenant(plan).find((option) => option.value === plan)
  return meta?.label ?? plan
}

export function describeTenantPlan(plan: string): string {
  const meta = planOptionsForTenant(plan).find((option) => option.value === plan)
  return meta?.description ?? '订阅计划决定默认配额与计费策略。'
}
