export const RECHARGE_ORDER_POLL_MS = 3000

const SETTLED_STATUSES = new Set(['paid', 'cancelled', 'expired', 'refunded'])

export function isRechargeOrderSettled(status?: string | null): boolean {
  return Boolean(status && SETTLED_STATUSES.has(status))
}

export function rechargeOrderPollInterval(status?: string | null): number | false {
  if (isRechargeOrderSettled(status)) {
    return false
  }
  return RECHARGE_ORDER_POLL_MS
}
