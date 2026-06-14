import type { PaymentRequiredDetail } from './types'

export type { PaymentRequiredDetail } from './types'

const INSUFFICIENT_BALANCE = 'insufficient_balance'

export function parsePaymentRequiredDetail(body: unknown): PaymentRequiredDetail | null {
  if (!body || typeof body !== 'object') return null
  const record = body as Record<string, unknown>
  const type = record.type
  if (typeof type !== 'string' || !type.includes(INSUFFICIENT_BALANCE)) return null
  if (record.status !== undefined && record.status !== 402) return null

  return {
    type,
    title: typeof record.title === 'string' ? record.title : undefined,
    detail: typeof record.detail === 'string' ? record.detail : undefined,
    availableBalance:
      typeof record.availableBalance === 'number' ? record.availableBalance : undefined,
    requiredPoints: typeof record.requiredPoints === 'number' ? record.requiredPoints : undefined,
  }
}
